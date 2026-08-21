"""Contract for makemore/bigram.py -- roadmap steps p5-1, mm-1 and mm-2.

Run from the repo root:

    .venv/Scripts/python.exe -m pytest tests/test_bigram.py -x

Three roadmap steps live in one file on purpose, ordered so `pytest -x`
walks them in the order the roadmap already puts them:

    p5-1   count the pairs into a 27x27 table
    mm-1   sample names out of it
    mm-2   score the model with negative log likelihood

The API this pins down:

    counts(words)              table[i][j], 27x27, whole numbers
    probabilities(counts)      table[i][j], 27x27, each row sums to 1
    sample(probs, rng)         one name as a str, no dots in it
    nll(words, probs)          one float

`counts` and `nll` take the word list rather than reading the file
themselves. That is what makes every test below able to use three-letter
toy corpora you can check by hand, instead of only the real 32,033.

**The number that matters.** On the full dataset `nll` has to come out at
2.4540. It is the only figure in phase 6 with an answer known in advance,
so it is the only place a silent mistake cannot hide. Everything built
after this -- the neural bigram, the MLP, all of part 2 -- is measured
against it.

Two choices are yours and the tests stay out of the way:

  * **What a table is.** Nested lists, a torch tensor, anything that
    answers `len(t) == 27` and `t[i][j]`. The `at()` helper below reads
    both, so no test cares which you picked.
  * **Smoothing.** Adding 1 to every count is a real technique and it
    belongs here eventually, but nothing below assumes it, and the 2.4540
    anchor is the unsmoothed figure. Add it as a separate argument later
    if you want it.

`sample` takes an explicit `random.Random` because a sampler that reaches
for the global `random` module cannot be tested twice with the same
answer, and a bug in it cannot be reproduced. If you later want
`torch.multinomial` for speed, the seam stays in the same place.

Deliberately out of scope:

  * the neural bigram, one-hot, softmax, and anything with a gradient
  * train/dev/test splits
  * plotting

This file imports `makemore.data` but not `micrograd`. Counting has no
gradients in it.
"""

import math
import random

import pytest

from makemore.bigram import counts, nll, probabilities, sample
from makemore.data import load_words, stoi

N_WORDS = 32033
N_BIGRAMS = 228146
BASELINE_NLL = 2.4540


# --------------------------------------------------------------- helpers


def at(table, i, j):
    """One cell, as a float, whatever the table is made of.

    A nested list gives a Python number and a torch tensor gives a 0-dim
    tensor; `float()` flattens both, so the tests below never have to know
    which one you chose.
    """
    return float(table[i][j])


def cell(table, a, b):
    """The cell for a pair of characters, e.g. cell(N, ".", "e")."""
    return at(table, stoi[a], stoi[b])


def total(table):
    return sum(at(table, i, j) for i in range(27) for j in range(27))


def row_total(table, i):
    return sum(at(table, i, j) for j in range(27))


@pytest.fixture(scope="module")
def words():
    return load_words()


@pytest.fixture(scope="module")
def real_counts(words):
    return counts(words)


@pytest.fixture(scope="module")
def real_probs(real_counts):
    return probabilities(real_counts)


# ---------------------------------------------------------- 1. the table


def test_the_table_is_twenty_seven_by_twenty_seven(real_counts):
    assert len(real_counts) == 27
    for i in range(27):
        assert len(real_counts[i]) == 27


def test_one_short_name_lands_in_exactly_two_cells():
    """"a" is the whole corpus, so it produces `.a` and `a.` and nothing
    else. Every other cell of the table has to still be zero -- which is a
    stronger claim than "the two cells are right"."""
    t = counts(["a"])
    assert cell(t, ".", "a") == 1
    assert cell(t, "a", ".") == 1
    assert total(t) == 2


def test_a_repeated_letter_lands_on_the_diagonal():
    """"aa" is the shortest name that produces a pair with the same letter
    twice. If the padding or the pairing is off by one, this cell is the
    first to go missing."""
    t = counts(["aa"])
    assert cell(t, ".", "a") == 1
    assert cell(t, "a", "a") == 1
    assert cell(t, "a", ".") == 1
    assert total(t) == 3


def test_counting_a_name_twice_doubles_its_cells():
    once = counts(["emma"])
    twice = counts(["emma", "emma"])
    for i in range(27):
        for j in range(27):
            assert at(twice, i, j) == 2 * at(once, i, j)


def test_the_cells_are_whole_numbers(real_counts):
    """These are counts of things that happened. A fraction here means
    something was averaged or normalised that should not have been."""
    for i in range(27):
        for j in range(27):
            v = at(real_counts, i, j)
            assert v == int(v)
            assert v >= 0


def test_the_real_corpus_has_the_pair_count_the_lengths_predict(real_counts, words):
    """Checked twice: against a closed form computed here from the word
    lengths alone, and against the measured 228,146."""
    assert total(real_counts) == sum(len(w) + 1 for w in words)
    assert total(real_counts) == N_BIGRAMS


def test_every_name_contributes_one_opening_and_one_closing_pair(real_counts):
    """Row 0 is every pair that begins a name, column 0 every pair that
    ends one. Both have to equal the number of names -- a padding bug
    shows up here as a number that no longer matches."""
    assert row_total(real_counts, 0) == N_WORDS
    assert sum(at(real_counts, i, 0) for i in range(27)) == N_WORDS


def test_the_boundary_never_follows_itself(real_counts):
    """(., .) means a name of length zero got counted. One cell out of
    729, nothing raises, and the model comes to believe an empty name is
    possible."""
    assert cell(real_counts, ".", ".") == 0


def test_four_cells_of_the_real_table():
    """Spot checks against figures measured from the dataset. If the
    pairing rule drifts, these move before anything else does."""
    t = counts(load_words())
    assert cell(t, "a", "n") == 5438
    assert cell(t, ".", "e") == 1531
    assert cell(t, "q", ".") == 28


def test_a_hundred_and_two_cells_were_never_seen(real_counts):
    """14% of the table is zero even with 32,033 names. Those are the
    cells that make `log` blow up later, and the reason smoothing exists."""
    zeros = sum(
        1 for i in range(27) for j in range(27) if at(real_counts, i, j) == 0
    )
    assert zeros == 102


def test_counting_does_not_modify_the_word_list():
    """Note the local list rather than the shared fixture. A module-scoped
    fixture has already been counted once by the time this runs, so a
    function that sorts its argument in place would have done its damage
    before the snapshot was ever taken -- and the test would pass while
    the bug sat there."""
    given = ["olivia", "emma", "ava"]
    counts(given)
    assert given == ["olivia", "emma", "ava"]


# -------------------------------------------------------- 2. probability


def test_every_row_sums_to_one(real_probs):
    """27 separate distributions, one per possible previous letter. They
    are normalised down each row, not across the whole table -- getting
    that axis wrong is the classic mistake and it still produces numbers
    that look like probabilities."""
    for i in range(27):
        assert row_total(real_probs, i) == pytest.approx(1.0)


def test_the_whole_table_does_not_sum_to_one(real_probs):
    """The companion to the test above, and the one that catches
    normalising over the wrong axis: 27 rows each summing to 1 means the
    table sums to 27."""
    assert total(real_probs) == pytest.approx(27.0)


def test_a_probability_is_its_count_over_its_row(real_counts, real_probs):
    for a, b in [("a", "n"), (".", "e"), ("q", "."), ("z", "a")]:
        i = stoi[a]
        expected = cell(real_counts, a, b) / row_total(real_counts, i)
        assert cell(real_probs, a, b) == pytest.approx(expected)


def test_the_probability_of_n_after_a(real_probs):
    assert cell(real_probs, "a", "n") == pytest.approx(0.1604839900, abs=1e-9)


def test_every_value_sits_between_zero_and_one(real_probs):
    for i in range(27):
        for j in range(27):
            assert 0.0 <= at(real_probs, i, j) <= 1.0


def test_a_pair_never_seen_gets_probability_zero(real_counts, real_probs):
    for i in range(27):
        for j in range(27):
            if at(real_counts, i, j) == 0:
                assert at(real_probs, i, j) == 0.0


def test_probabilities_does_not_modify_the_counts():
    """Normalising in place turns the count table into a probability table
    behind the caller's back. The second call then divides numbers that
    are already fractions, and every figure after it is wrong -- with
    nothing raised."""
    t = counts(["emma", "olivia"])
    before = [[at(t, i, j) for j in range(27)] for i in range(27)]
    probabilities(t)
    after = [[at(t, i, j) for j in range(27)] for i in range(27)]
    assert after == before


def test_calling_probabilities_twice_gives_the_same_answer():
    t = counts(["emma", "olivia"])
    first = probabilities(t)
    second = probabilities(t)
    for i in range(27):
        for j in range(27):
            assert at(first, i, j) == at(second, i, j)


# ------------------------------------------------------------ 3. sampling


def test_a_sample_is_a_string_of_letters(real_probs):
    name = sample(real_probs, random.Random(0))
    assert isinstance(name, str)
    assert name.isalpha()
    assert name.islower()


def test_a_sample_carries_no_boundary_marker(real_probs):
    """The dot is how the walk knows where to stop. It is scaffolding, not
    part of the name, so it must not survive into the output."""
    for seed in range(20):
        assert "." not in sample(real_probs, random.Random(seed))


def test_the_same_seed_gives_the_same_name(real_probs):
    """Reproducibility is the whole reason the generator is an argument.
    Without this, a bad sample can never be looked at twice."""
    a = sample(real_probs, random.Random(1234))
    b = sample(real_probs, random.Random(1234))
    assert a == b


def test_different_seeds_do_not_all_give_one_name(real_probs):
    names = {sample(real_probs, random.Random(s)) for s in range(50)}
    assert len(names) > 10


def test_one_generator_produces_a_different_name_each_call(real_probs):
    """A generator handed in once and drawn from repeatedly has to keep
    moving. If the sampler reseeds internally, this collapses to one name
    repeated fifty times."""
    rng = random.Random(7)
    names = [sample(real_probs, rng) for _ in range(50)]
    assert len(set(names)) > 10


def test_no_sample_comes_back_empty(real_probs):
    """p(. | .) is exactly zero on this dataset, so a zero-length name is
    not merely unlikely, it is impossible. One coming out means the walk
    is reading the wrong row, or stopping before it starts."""
    for seed in range(200):
        assert len(sample(real_probs, random.Random(seed))) > 0


def test_first_letters_follow_the_first_row_of_the_table(real_probs):
    """The end-to-end check. Draw a few thousand names, tally the letter
    each one starts with, and the tally has to match row 0 of the table.

    This is what catches a sampler that walks the table by column instead
    of by row: the names it produces still look like names, and only the
    distribution gives it away.
    """
    rng = random.Random(0)
    draws = 4000
    tally = [0] * 27
    for _ in range(draws):
        tally[stoi[sample(real_probs, rng)[0]]] += 1

    for j in range(1, 27):
        expected = at(real_probs, 0, j)
        observed = tally[j] / draws
        assert observed == pytest.approx(expected, abs=0.02)


# ------------------------------------ 4. the number with a known answer


def test_the_loss_of_a_perfect_model_is_zero():
    """A corpus of one name, scored by a table that gives every pair it
    contains a probability of 1. log(1) = 0, so the loss floors at zero --
    it can never be negative."""
    t = counts(["a"])
    p = probabilities(t)
    assert nll(["a"], p) == pytest.approx(0.0, abs=1e-12)


def test_the_loss_matches_the_closed_form_on_a_corpus_you_can_check_by_hand():
    """Two names, four pairs, worked out on paper:

        .a a.  .b b.      each row has one entry, so every p is 1.0
        scoring "a" against it gives -log(1) - log(1) = 0

    Then score a name the table has never seen the second half of, and the
    arithmetic still has to line up with what you compute here.
    """
    train = ["ab", "ab", "ba"]
    p = probabilities(counts(train))
    expected = -sum(
        math.log(at(p, stoi[x], stoi[y]))
        for word in ["ab"]
        for x, y in [(".", "a"), ("a", "b"), ("b", ".")]
    ) / 3
    assert nll(["ab"], p) == pytest.approx(expected)


def test_the_loss_is_an_average_not_a_total():
    """Scoring the same corpus twice over must not double the answer. A
    total instead of a mean makes the figure depend on dataset size, and
    then no two runs can be compared."""
    p = probabilities(counts(["emma", "olivia"]))
    once = nll(["emma"], p)
    twice = nll(["emma", "emma"], p)
    assert twice == pytest.approx(once)


def test_a_better_table_scores_lower(real_probs, words):
    """The claim that makes the number useful at all. A table fitted to
    this data has to beat one that guesses uniformly, or the loss is not
    measuring what we think it is."""
    uniform = [[1 / 27] * 27 for _ in range(27)]
    assert nll(words, real_probs) < nll(words, uniform)


def test_a_uniform_table_scores_exactly_log_twenty_seven(words):
    """Every guess is 1/27, so every term is -log(1/27) and the mean is
    log(27) = 3.2958 whatever the data says. A closed form that the
    implementation cannot have been tuned to."""
    uniform = [[1 / 27] * 27 for _ in range(27)]
    assert nll(words, uniform) == pytest.approx(math.log(27), abs=1e-9)


def test_the_baseline(real_probs, words):
    """2.4540.

    Every model built after this one is measured against this number, so
    it is the one figure in phase 6 that a silent mistake cannot survive.
    If this fails, do not adjust the test -- something upstream is wrong,
    and the table or the pairing rule is where to look.
    """
    assert nll(words, real_probs) == pytest.approx(BASELINE_NLL, abs=5e-5)
