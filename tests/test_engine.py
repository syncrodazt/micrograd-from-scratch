"""The contract for micrograd/engine.py.

Run from the repo root:

    .venv/Scripts/python.exe -m pytest

Read this file as a specification. It says *what* the engine must do and
never *how* to do it -- there is no implementation hint anywhere in here.
If a rebuild from an empty file makes every test below pass, the rebuild is
genuinely finished.

Every test is named as a sentence so a failure reads like a statement of
what broke, not like a label.
"""

import pytest, math

from micrograd.engine import Value

# --------------------------------------------------------------- forward


def test_a_value_stores_its_data():
    assert Value(2.0).data == 2.0


def test_repr_shows_the_data():
    assert "2.0" in repr(Value(2.0))


def test_addition_and_multiplication_compute_the_right_number():
    a, b = Value(2.0), Value(-3.0)
    assert (a + b).data == -1.0
    assert (a * b).data == -6.0


def test_expressions_nest():
    a, b, c = Value(2.0), Value(-3.0), Value(10.0)
    assert (a * b + c).data == 4.0


# ----------------------------------------------------------------- graph


def test_a_result_remembers_which_values_produced_it():
    a, b = Value(2.0), Value(-3.0)
    assert {id(n) for n in (a * b)._prev} == {id(a), id(b)}


def test_a_result_remembers_which_operation_produced_it():
    a, b = Value(2.0), Value(-3.0)
    assert (a + b)._op == "+"
    assert (a * b)._op == "*"


def test_a_leaf_has_no_parents_and_no_operation():
    leaf = Value(2.0)
    assert list(leaf._prev) == []
    assert leaf._op == ""


def test_one_leafs_parents_never_leak_into_another():
    """The mutable-default trap. If the empty default were one shared list,
    building any graph would quietly give every leaf ever created a set of
    parents it does not have."""
    first = Value(1.0)
    Value(2.0) * Value(3.0)
    Value(4.0) + Value(5.0)
    assert list(first._prev) == []
    assert list(Value(6.0)._prev) == []


def test_a_value_used_twice_appears_twice_in_the_graph():
    """x + x is not the same graph as x + y. The engine has to record both
    references or the drawn graph is a lie about what was computed."""
    x = Value(3.0)
    assert len(list((x + x)._prev)) == 2


# ------------------------------------------------------------- gradients


def test_gradients_start_at_zero():
    assert Value(2.0).grad == 0.0


def test_backward_seeds_the_root_with_one():
    d = Value(2.0) * Value(3.0)
    d.backward()
    assert d.grad == 1.0


def test_addition_passes_the_incoming_gradient_through_unchanged():
    a, b = Value(2.0), Value(3.0)
    (a + b).backward()
    assert a.grad == 1.0
    assert b.grad == 1.0


def test_multiplication_hands_each_side_the_value_of_the_other():
    a, b = Value(2.0), Value(3.0)
    (a * b).backward()
    assert a.grad == 3.0
    assert b.grad == 2.0


def test_the_incoming_gradient_is_carried_into_the_local_one():
    """Catches the classic slip of writing the local derivative alone and
    dropping the factor flowing down from above. A test where every
    gradient happens to be 1.0 cannot see this."""
    x, y = Value(3.0), Value(2.0)
    z = x * y
    q = z * z  # gradient reaching z is 2z = 12, not 1
    q.backward()
    assert z.grad == 12.0
    assert x.grad == 24.0
    assert y.grad == 36.0


def test_a_gradient_accumulates_when_a_value_is_used_twice():
    """The deepest line in the whole engine. dz/dx for z = x + x is 2."""
    x = Value(3.0)
    (x + x).backward()
    assert x.grad == 2.0


def test_a_shared_interior_node_collects_from_every_parent():
    """m feeds two different branches that meet again at the root, so
    everything below m is only correct once both branches have contributed.
    Getting 630 instead of 1260 means one path was lost or arrived late."""
    x, y = Value(2.0), Value(3.0)
    p, q = Value(5.0), Value(7.0)
    m = x * y
    d = (m * p) * (m * q)
    d.backward()

    assert d.data == 1260.0
    assert m.grad == 420.0
    assert p.grad == 252.0
    assert q.grad == 180.0
    assert x.grad == 1260.0
    assert y.grad == 840.0


def test_deep_chains_do_not_lose_gradient():
    """Sixteen levels of v + v. The graph has 17 nodes but 2**17 paths, so
    anything that walks paths instead of nodes will not finish."""
    x = Value(1.0)
    v = x
    for _ in range(16):
        v = v + v
    v.backward()
    assert x.grad == 2.0**16


# ------------------------------- an independent check: numerical gradient


def numerical_gradient(f, xs, i, h=1e-6):
    """Central difference on plain floats.

    This knows nothing about Value, so it cannot repeat the engine's
    mistakes -- which is exactly what makes it worth having.
    """
    up, down = list(xs), list(xs)
    up[i] += h
    down[i] -= h
    return (f(*up) - f(*down)) / (2 * h)


EXPRESSIONS = [
    pytest.param(lambda a, b, c: a * b + c, id="a*b+c"),
    pytest.param(lambda a, b, c: (a + b) * (b + c), id="(a+b)*(b+c)"),
    pytest.param(lambda a, b, c: a * a + b * c, id="a*a+b*c"),
    pytest.param(lambda a, b, c: (a * b) * (a * c), id="(a*b)*(a*c)"),
    pytest.param(lambda a, b, c: a + a + a, id="a+a+a"),
    pytest.param(lambda a, b, c: (a + b * c) * (a * b + c), id="mixed"),
]


@pytest.mark.parametrize("f", EXPRESSIONS)
def test_backward_agrees_with_the_numerical_gradient(f):
    xs = [2.0, -3.0, 4.0]
    values = [Value(x) for x in xs]

    f(*values).backward()

    for i, v in enumerate(values):
        expected = numerical_gradient(f, xs, i)
        assert v.grad == pytest.approx(expected, rel=1e-4, abs=1e-6)


# ------------------------------------------------- deliberate behaviour


def test_calling_backward_twice_accumulates_and_that_is_on_purpose():
    """Not a bug to fix. backward() reseeds only the root, so every other
    node keeps adding on top of what it already had.

    PyTorch made the same choice, which is why zeroing the gradients is a
    separate step you have to remember. Leaving it out of a training loop
    is the single most common mistake in the whole subject.
    """
    a, b = Value(2.0), Value(3.0)
    d = a * b
    d.backward()
    d.backward()
    assert a.grad == 6.0  # 3.0 twice


# ---------------------------------------------------------------------
# Write your own below.  Suggestions, hardest last:
#
#   - a value that is a leaf in one expression and interior in another
#   - a graph where the same node sits at two different depths
#   - backward() called on something that is not the outermost value
#     (a.backward() is legal and means "treat a as the final output")
#   - the label survives being carried through an operation
# ---------------------------------------------------------------------


def test_tanh_gradient_at_zero():
    xs = [0.0]
    x = Value(xs[0])
    y = x.tanh()
    y.backward()

    expected = numerical_gradient(math.tanh, xs, 0)
    assert x.grad == pytest.approx(expected, rel=1e-4, abs=1e-6)


def test_tanh_gradient_where_tanh_is_inside():
    xs = [2.0]
    x = Value(xs[0])
    y = x.tanh()
    z = y * y
    z.backward()

    expected = numerical_gradient(lambda x: math.tanh(x) * math.tanh(x), xs, 0)
    assert x.grad == pytest.approx(expected, rel=1e-4, abs=1e-6)


CASES = [
    pytest.param(lambda a, b, c: a.tanh(), lambda a, b, c: math.tanh(a), id="tanh"),
    pytest.param(
        lambda a, b, c: a.tanh() * a.tanh(),
        lambda a, b, c: math.tanh(a) * math.tanh(a),
        id="tanh^2",
    ),
]


@pytest.mark.parametrize("on_values, on_float", CASES)
def test_backward_agrees_with_the_numerical_gradient_tanh(on_values, on_float):
    xs = [2.0, -3.0, 4.0]
    values = [Value(x) for x in xs]

    on_values(*values).backward()

    for i, v in enumerate(values):
        expected = numerical_gradient(on_float, xs, i)
        assert v.grad == pytest.approx(expected, rel=1e-4, abs=1e-6)
