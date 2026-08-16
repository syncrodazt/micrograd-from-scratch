"""Contract for makemore/data.py -- roadmap step mm-0.

Run from the repo root:

    .venv/Scripts/python.exe -m pytest tests/test_makemore_data.py -x

Same rules as the three test files before it: this says *what* the module
must do, never how. Sections build on each other, so `pytest -x` walks a
sensible build order -- loading, then the alphabet, then the pairing rule,
then the whole corpus at once.

The API this pins down:

    load_words(path=None)   list[str] -- no argument loads the bundled
                            names.txt; a path loads that file instead
    stoi                    dict[str, int]  module-level
    itos                    dict[int, str]  module-level
    bigrams(word)           iterable of (str, str) character pairs

Three choices are fixed here on purpose, each with a reason:

  * `.` is index 0, letters are 1..26 in alphabetical order. Correctness
    does not depend on this, but every printed 27x27 table and every
    number in Lesson 11 does -- a different mapping makes them
    incomparable for no gain.
  * `bigrams` yields *characters*, not indices. Indices are one `stoi[c]`
    away whenever you want them, and a failing assertion that reads
    ('.', 'e') tells you more than (0, 5).
  * `load_words` accepts a path so the parsing rules can be tested on
    small files you can read in one glance. The no-argument form is the
    one the rest of makemore/ will actually call.

Whether `stoi` is hard-coded from the alphabet or derived from the loaded
words is yours -- both give the same 27 entries for this dataset.

`bigrams` may return a list, a tuple, or anything else you like, with one
requirement: the thing it returns has to survive being read twice. A bare
generator does not, and the rest of makemore/ will walk the same pairs
more than once.

Deliberately out of scope, and not by accident:

  * the 27x27 count table (roadmap p5-1) -- that is bigram.py
  * sampling, negative log likelihood, torch, train/dev/test splits
  * anything that has a gradient in it

This file does not import micrograd at all. Data preparation should not
know that an autograd engine exists.
"""

import pytest

from makemore.data import bigrams, itos, load_words, stoi


# --------------------------------------------------------------- helpers


def pairs(word):
    """A list of the pairs, whatever concrete type `bigrams` hands back.

    Everything below compares pairs by value, so a list, a tuple, or your
    own sequence type all read the same here.
    """
    return list(bigrams(word))


def write_names(tmp_path, text):
    p = tmp_path / "tiny.txt"
    p.write_text(text, encoding="utf-8")
    return p


# ---------------------------------------------------------- 1. load_words


def test_loading_the_bundled_file_needs_no_argument():
    assert len(load_words()) == 32033


def test_the_first_and_last_names_are_what_the_file_says():
    words = load_words()
    assert words[0] == "emma"
    assert words[-1] == "zzyzx"


def test_every_name_is_a_bare_lowercase_word():
    """No newlines, no spaces, no empty strings. Anything left clinging to
    a name becomes a 28th symbol later, and the table quietly grows a row
    nobody asked for."""
    for w in load_words():
        assert w
        assert w == w.strip()
        assert w.islower()
        assert w.isalpha()


def test_the_file_is_found_no_matter_where_you_run_from(tmp_path, monkeypatch):
    """The bundled path has to be resolved relative to the module, not to
    the shell's current directory. Getting this wrong produces a module
    that works in the notebook, works under `pytest` from the repo root,
    and dies the first time anyone runs it from anywhere else.

    Same shape as the sys.path lesson: the thing that varies is not the
    code, it is where you happened to be standing when you ran it.
    """
    monkeypatch.chdir(tmp_path)
    assert len(load_words()) == 32033


def test_a_given_path_is_read_instead_of_the_bundled_file(tmp_path):
    p = write_names(tmp_path, "ada\nbo\ncy\n")
    assert load_words(p) == ["ada", "bo", "cy"]


def test_blank_lines_and_stray_whitespace_do_not_become_names(tmp_path):
    """A trailing newline at the end of a file is normal and invisible.
    If it survives as an empty name, that name contributes a ('.', '.')
    pair, which lands in the one cell of the table that should never be
    touched -- and nothing raises."""
    p = write_names(tmp_path, "\nada\n\n  bo  \ncy\n\n")
    assert load_words(p) == ["ada", "bo", "cy"]


# --------------------------------------------------------- 2. stoi / itos


def test_the_alphabet_has_exactly_twenty_seven_symbols():
    assert len(stoi) == 27
    assert len(itos) == 27


def test_the_dot_is_index_zero():
    """One symbol serves as both the start and the end of a name. It can,
    because the two roles never appear on the same side of a pair -- the
    position already carries that information."""
    assert stoi["."] == 0
    assert itos[0] == "."


def test_the_letters_run_from_one_to_twenty_six_in_order():
    for n, letter in enumerate("abcdefghijklmnopqrstuvwxyz", start=1):
        assert stoi[letter] == n


def test_itos_is_the_exact_inverse_of_stoi():
    """Two dicts that are supposed to describe one mapping. Building them
    independently is how they drift apart."""
    assert {i: s for s, i in stoi.items()} == itos
    assert {s: i for i, s in itos.items()} == stoi


def test_the_indices_are_a_gapless_range():
    """0..26 with nothing missing and nothing repeated -- this is what
    makes them usable as row and column numbers directly."""
    assert sorted(stoi.values()) == list(range(27))


def test_every_character_in_the_dataset_has_an_index():
    for w in load_words():
        for ch in w:
            assert ch in stoi


# ------------------------------------------------------------- 3. bigrams


def test_a_four_letter_name_produces_five_pairs():
    """n letters give n+1 pairs, not n-1. The two extra come from the
    boundaries, and they are the whole point: without them the model can
    say what follows 'm', but not what a name is allowed to start with."""
    assert len(pairs("emma")) == 5


def test_the_first_pair_starts_at_the_boundary():
    assert pairs("emma")[0][0] == "."


def test_the_last_pair_ends_at_the_boundary():
    assert pairs("emma")[-1][1] == "."


def test_consecutive_pairs_overlap_by_one_character():
    """The pairs form a chain: whatever a pair ends on, the next one
    starts on. A dropped or duplicated character breaks the chain here
    even when the count still looks right."""
    ps = pairs("emma")
    for (_, right), (left, _) in zip(ps, ps[1:]):
        assert right == left


def test_the_word_can_be_read_back_out_of_its_pairs():
    """An independent route to the same information: take the second
    character of every pair, drop the closing boundary, and the original
    word has to come back."""
    for word in ["emma", "olivia", "ava", "zzyzx"]:
        seconds = "".join(right for _, right in pairs(word))
        assert seconds == word + "."


def test_a_one_letter_name_still_gets_both_boundaries():
    """The shortest interesting case, and the one an off-by-one in the
    padding is most likely to mangle."""
    assert pairs("a") == [(".", "a"), ("a", ".")]


def test_every_pair_is_two_single_characters():
    for left, right in pairs("emma"):
        assert isinstance(left, str) and len(left) == 1
        assert isinstance(right, str) and len(right) == 1


def test_the_boundary_never_appears_in_the_middle_of_a_name():
    """Only the first pair may open with '.', only the last may close
    with it. A '.' anywhere else means a name got padded twice."""
    ps = pairs("emma")
    assert all(left != "." for left, _ in ps[1:])
    assert all(right != "." for _, right in ps[:-1])


def test_the_pairs_survive_being_read_twice():
    """Note what this reads: one call, two reads of the *same* returned
    object. A generator passes a test that calls `bigrams` twice, and
    fails this one.

    It matters because bigram.py will walk these pairs once to build the
    count table and again to score the model. A sequence that empties
    itself after the first pass does not raise -- the second pass just
    sees nothing, and the table comes back full of zeros.
    """
    got = bigrams("emma")
    assert list(got) == list(got)
    assert len(list(got)) == 5


# ------------------------------------- 4. the whole corpus, counted twice


def test_the_corpus_produces_the_number_of_pairs_the_lengths_predict():
    """Checked against a closed form computed here, from the word lengths
    alone, which knows nothing about how `bigrams` was written. 228,146
    is also the figure Lesson 11 measured -- if this test fails, every
    number in that lesson is now about a different dataset than yours."""
    words = load_words()
    counted = sum(len(pairs(w)) for w in words)
    assert counted == sum(len(w) + 1 for w in words)
    assert counted == 228146


def test_each_name_contributes_exactly_one_opening_and_one_closing_pair():
    """32,033 names, so 32,033 pairs that begin a name and 32,033 that end
    one. A padding bug that adds or drops a boundary shows up here as a
    number that no longer matches the name count."""
    words = load_words()
    opens = sum(1 for w in words for left, _ in pairs(w) if left == ".")
    closes = sum(1 for w in words for _, right in pairs(w) if right == ".")
    assert opens == len(words) == 32033
    assert closes == len(words) == 32033


def test_no_pair_in_the_corpus_is_the_boundary_twice():
    """('.', '.') means an empty name got through. It is one cell out of
    729, it raises nothing, and it makes the model believe a name of
    length zero is possible."""
    for w in load_words():
        assert (".", ".") not in pairs(w)


def test_every_character_produced_by_the_corpus_is_in_the_alphabet():
    """The bridge between sections 2 and 3: whatever `bigrams` emits must
    be indexable, because the next roadmap step uses these as row and
    column numbers of a 27x27 table."""
    seen = set()
    for w in load_words():
        for left, right in pairs(w):
            seen.add(left)
            seen.add(right)
    assert seen == set(stoi)


@pytest.mark.parametrize(
    "word, expected",
    [
        ("a", 2),
        ("ab", 3),
        ("emma", 5),
        ("olivia", 7),
        ("zzyzx", 6),
    ],
)
def test_pair_counts_for_names_of_various_lengths(word, expected):
    assert len(pairs(word)) == expected
