"""Contract for the operations added in phase 3.

Run from the repo root:

    .venv/Scripts/python.exe -m pytest tests/test_ops.py -x

Same rules as test_engine.py: this file says *what* each operation must do
and never *how*. Work down the file in order -- each section only needs the
ones above it, so `pytest -x` walks you through a sensible build order.

Out of scope on purpose: `Value ** Value`. The exponent stays a plain
number, which is what the whole series needs and keeps `__pow__` to one
rule instead of two.
"""

import math

import pytest

from micrograd.engine import Value


# --------------------------------------------------------------- helpers


def numerical_gradient(f, xs, i, h=1e-6):
    """Central difference on plain floats. Knows nothing about Value."""
    up, down = list(xs), list(xs)
    up[i] += h
    down[i] -= h
    return (f(*up) - f(*down)) / (2 * h)


def assert_gradients_match_numerical(on_values, on_floats, xs):
    """Build the expression twice -- once out of Values, once out of floats --
    and check every gradient against the numerical estimate.

    Two callables are needed because operators are the only vocabulary both
    types share; `x.exp()` exists only on Value and `math.exp(x)` only takes
    a real number.
    """
    values = [Value(x) for x in xs]
    on_values(*values).backward()

    for i, v in enumerate(values):
        expected = numerical_gradient(on_floats, xs, i)
        assert v.grad == pytest.approx(expected, rel=1e-4, abs=1e-6), (
            f"gradient for argument {i} of {xs}"
        )


# ------------------------------------------- 1. plain numbers on the right


def test_a_value_plus_a_plain_number():
    assert (Value(2.0) + 1).data == 3.0


def test_a_value_times_a_plain_number():
    assert (Value(2.0) * 3).data == 6.0


def test_gradient_flows_through_a_plain_number():
    x = Value(2.0)
    (x * 3).backward()
    assert x.grad == 3.0


def test_a_plain_number_becomes_part_of_the_graph():
    """However the number gets in, the result still has two parents: the
    graph has to stay a faithful record of what was computed."""
    t = Value(2.0) + 1
    assert len(list(t._prev)) == 2


# --------------------------------------------- 2. plain numbers on the left


def test_a_number_on_the_left_of_plus():
    """`a + 1` and `1 + a` look symmetric but reach the engine by different
    routes: Python asks the left operand first, and `int` has no idea what a
    Value is. Passing the previous section says nothing about this one."""
    assert (1 + Value(2.0)).data == 3.0


def test_a_number_on_the_left_of_times():
    assert (3 * Value(2.0)).data == 6.0


def test_gradient_still_flows_with_the_number_on_the_left():
    x = Value(2.0)
    (3 * x).backward()
    assert x.grad == 3.0


# ---------------------------------------------- 3. negation and subtraction


def test_negation_flips_the_sign():
    assert (-Value(2.0)).data == -2.0


def test_negation_gradient_is_minus_one():
    x = Value(2.0)
    (-x).backward()
    assert x.grad == -1.0


def test_subtraction_computes_the_right_number():
    assert (Value(5.0) - Value(3.0)).data == 2.0


def test_subtraction_gradients_have_opposite_signs():
    a, b = Value(5.0), Value(3.0)
    (a - b).backward()
    assert a.grad == 1.0
    assert b.grad == -1.0


def test_subtraction_with_plain_numbers_on_either_side():
    assert (Value(5.0) - 2).data == 3.0
    assert (5 - Value(2.0)).data == 3.0


def test_a_value_minus_itself_is_zero_with_zero_gradient():
    """Both routes to x cancel. If the gradients did not accumulate this
    would come out as +1 or -1 instead of 0."""
    x = Value(4.0)
    d = x - x
    d.backward()
    assert d.data == 0.0
    assert x.grad == 0.0


# ------------------------------------------------------------- 4. powers


def test_power_with_a_whole_number():
    assert (Value(3.0) ** 2).data == 9.0


def test_power_gradient():
    x = Value(2.0)
    (x**3).backward()
    assert x.grad == 12.0  # 3 * 2**2


def test_negative_power_is_a_reciprocal():
    x = Value(4.0)
    y = x**-1
    y.backward()
    assert y.data == 0.25
    assert x.grad == pytest.approx(-1 / 16)


def test_fractional_power_is_a_root():
    x = Value(9.0)
    y = x**0.5
    y.backward()
    assert y.data == 3.0
    assert x.grad == pytest.approx(1 / 6)


# ----------------------------------------------------------- 5. division


def test_division_computes_the_right_number():
    assert (Value(6.0) / Value(3.0)).data == 2.0


def test_division_by_a_plain_number():
    assert (Value(6.0) / 2).data == 3.0


def test_a_plain_number_divided_by_a_value():
    assert (6 / Value(3.0)).data == 2.0


def test_division_gradients():
    a, b = Value(6.0), Value(3.0)
    (a / b).backward()
    assert a.grad == pytest.approx(1 / 3)  #  1/b
    assert b.grad == pytest.approx(-2 / 3)  # -a/b**2


# ---------------------------------------------------------------- 6. exp


def test_exp_of_zero_is_one():
    assert Value(0.0).exp().data == 1.0


def test_exp_is_its_own_derivative():
    x = Value(1.5)
    y = x.exp()
    y.backward()
    assert x.grad == pytest.approx(y.data)


def test_exp_has_a_single_parent():
    assert len(list(Value(1.0).exp()._prev)) == 1


# ----------------------------------- 7. the payoff: tanh rebuilt from exp


def tanh_from_exp(x):
    """tanh(x) = (e^2x - 1) / (e^2x + 1), assembled out of smaller pieces.

    Uses scalar multiply, exp, scalar add, scalar subtract and division --
    everything above this line at once.
    """
    n = (2 * x).exp()
    return (n - 1) / (n + 1)


@pytest.mark.parametrize("x0", [0.0, 0.5, -1.3, 2.0])
def test_tanh_matches_the_version_built_from_exp(x0):
    """How finely an operation is broken down is an engineering choice, not
    a fact about the mathematics. Both routes must agree on the value *and*
    on the gradient, or one of the two backward rules is wrong."""
    a = Value(x0)
    direct = a.tanh()
    direct.backward()

    b = Value(x0)
    built = tanh_from_exp(b)
    built.backward()

    assert direct.data == pytest.approx(built.data)
    assert a.grad == pytest.approx(b.grad, rel=1e-9)


# ------------------------------------- 8. numerical sweep over everything


CASES = [
    pytest.param(lambda a, b, c: a * 2 + 1, lambda a, b, c: a * 2 + 1, id="a*2+1"),
    pytest.param(lambda a, b, c: 3 * a + b, lambda a, b, c: 3 * a + b, id="3*a+b"),
    pytest.param(lambda a, b, c: a - b, lambda a, b, c: a - b, id="a-b"),
    pytest.param(lambda a, b, c: 1 - a, lambda a, b, c: 1 - a, id="1-a"),
    pytest.param(lambda a, b, c: -a * b, lambda a, b, c: -a * b, id="-a*b"),
    pytest.param(lambda a, b, c: a**3, lambda a, b, c: a**3, id="a**3"),
    pytest.param(lambda a, b, c: a / b, lambda a, b, c: a / b, id="a/b"),
    pytest.param(lambda a, b, c: 2 / a, lambda a, b, c: 2 / a, id="2/a"),
    pytest.param(lambda a, b, c: a.exp(), lambda a, b, c: math.exp(a), id="exp(a)"),
    pytest.param(
        lambda a, b, c: (a * b).exp() / (c + 1),
        lambda a, b, c: math.exp(a * b) / (c + 1),
        id="exp(a*b)/(c+1)",
    ),
    pytest.param(
        lambda a, b, c: a.tanh() * b - c**2,
        lambda a, b, c: math.tanh(a) * b - c**2,
        id="tanh(a)*b-c**2",
    ),
    pytest.param(
        lambda a, b, c: (a - b) / (a * c),
        lambda a, b, c: (a - b) / (a * c),
        id="(a-b)/(a*c)",
    ),
]


@pytest.mark.parametrize("on_values, on_floats", CASES)
def test_every_operation_agrees_with_the_numerical_gradient(on_values, on_floats):
    assert_gradients_match_numerical(on_values, on_floats, [2.0, -3.0, 4.0])


@pytest.mark.parametrize("on_values, on_floats", CASES)
def test_the_same_expressions_at_different_inputs(on_values, on_floats):
    """Different signs and magnitudes, in case a rule happens to be right
    only for positive numbers."""
    assert_gradients_match_numerical(on_values, on_floats, [-1.5, 0.7, 3.0])
