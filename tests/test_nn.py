"""Contract for micrograd/nn.py.

Run from the repo root:

    .venv/Scripts/python.exe -m pytest tests/test_nn.py -x

Same rules as before: this file says *what* the network must do, never how.
Sections build on each other, so `pytest -x` walks a sensible order:
Neuron, then Layer, then MLP, then the one claim that makes training work.

The shapes assumed here are the ones the roadmap already committed to:

    Neuron(nin)             callable, one output
    Layer(nin, nout)        callable, nout outputs
    MLP(nin, [n1, n2, ...]) callable, n_last outputs
    .parameters()           on all three

One ordering promise, because two tests below lean on it: `parameters()`
comes back in the order the network is laid out -- earlier layers first,
earlier neurons first, and within a neuron the weights in input order
followed by the bias.

Deliberately absent: any training loop, and anything about resetting
gradients between steps. Those are yours to write and yours to get wrong.
"""

import pytest

from micrograd.engine import Value
from micrograd.nn import MLP, Layer, Neuron


# --------------------------------------------------------------- helpers


def outputs(result):
    """Accept either a bare Value or a list of them.

    Whether a layer with one output returns `[v]` or `v` is a design choice
    that belongs to you, so the tests refuse to care.
    """
    return [result] if isinstance(result, Value) else list(result)


def total_gradient(params):
    return sum(abs(p.grad) for p in params)


# -------------------------------------------------------------- 1. Neuron


def test_a_neuron_has_one_weight_per_input_plus_a_bias():
    n = Neuron(3)
    assert len(n.parameters()) == 4


def test_every_parameter_is_a_value():
    assert all(isinstance(p, Value) for p in Neuron(3).parameters())


def test_parameters_are_the_real_objects_not_copies():
    """Training works by writing into `p.data`. If `parameters()` handed back
    copies, every update would land somewhere the network never reads."""
    n = Neuron(3)
    first = n.parameters()[0]
    first.data = 12345.0
    assert n.parameters()[0].data == 12345.0


def test_two_neurons_do_not_start_identical():
    """Symmetry has to be broken at birth. Neurons that start equal see the
    same inputs and the same gradients, so they stay equal forever and the
    layer only ever learns one thing."""
    a = [p.data for p in Neuron(4).parameters()]
    b = [p.data for p in Neuron(4).parameters()]
    assert a != b


def test_one_neurons_weights_are_not_all_the_same_number():
    weights = [p.data for p in Neuron(6).parameters()]
    assert len(set(weights)) > 1


def test_calling_a_neuron_gives_back_a_single_value():
    out = outputs(Neuron(3)([1.0, -2.0, 3.0]))
    assert len(out) == 1
    assert isinstance(out[0], Value)


def test_a_neuron_squashes_its_output():
    """A neuron is a weighted sum followed by a non-linearity. Without the
    squashing step a stack of layers collapses into a single linear map, no
    matter how deep it is."""
    out = outputs(Neuron(3)([50.0, 50.0, 50.0]))[0]
    assert -1.0 <= out.data <= 1.0


def test_a_neuron_accepts_values_as_well_as_plain_numbers():
    n = Neuron(2)
    assert isinstance(outputs(n([Value(1.0), Value(2.0)]))[0], Value)
    assert isinstance(outputs(n([1.0, 2.0]))[0], Value)


def test_backward_reaches_every_parameter_of_a_neuron():
    n = Neuron(3)
    outputs(n([1.0, -2.0, 3.0]))[0].backward()
    assert all(p.grad != 0.0 for p in n.parameters())


def test_each_weight_gradient_is_the_bias_gradient_times_its_input():
    """Both the bias and every weight sit under the same non-linearity, so
    whatever factor comes down from it is shared. What separates them is
    only the input each weight was multiplied by -- which makes this ratio
    a tight check on the entire chain from output back to parameter.

    A weight fed a large input gets a proportionally large gradient. That
    is also why wildly different input scales make a network hard to train.
    """
    x = [1.0, -2.0, 3.0]
    n = Neuron(3)
    outputs(n(x))[0].backward()

    *weights, bias = n.parameters()
    assert bias.grad != 0.0
    for w, xi in zip(weights, x):
        assert w.grad == pytest.approx(bias.grad * xi)


# --------------------------------------------------------------- 2. Layer


def test_a_layer_produces_one_output_per_neuron():
    assert len(outputs(Layer(3, 5)([1.0, 2.0, 3.0]))) == 5


def test_a_layer_holds_every_neurons_parameters():
    assert len(Layer(3, 5).parameters()) == 5 * (3 + 1)


def test_a_layer_of_one_still_works():
    assert len(outputs(Layer(4, 1)([1.0, 2.0, 3.0, 4.0]))) == 1


def test_the_neurons_in_a_layer_are_different_from_each_other():
    outs = [v.data for v in outputs(Layer(3, 4)([1.0, 2.0, 3.0]))]
    assert len(set(outs)) > 1


def test_backward_from_one_output_reaches_only_that_neuron():
    """Neurons in a layer are independent: nothing connects them sideways,
    so a gradient entering one of them has no route into the others."""
    layer = Layer(3, 3)
    outs = outputs(layer([1.0, 2.0, 3.0]))
    outs[0].backward()

    touched = [p for p in layer.parameters() if p.grad != 0.0]
    assert len(touched) == 4


# ----------------------------------------------------------------- 3. MLP


def test_an_mlp_ends_with_as_many_outputs_as_its_last_layer():
    assert len(outputs(MLP(3, [4, 4, 2])([1.0, 2.0, 3.0]))) == 2


def test_an_mlp_collects_the_parameters_of_every_layer():
    """3 -> 4 -> 4 -> 1, so 4*(3+1) + 4*(4+1) + 1*(4+1)."""
    assert len(MLP(3, [4, 4, 1]).parameters()) == 16 + 20 + 5


def test_backward_reaches_the_very_first_layer():
    """The whole point. A gradient computed at the output has to survive
    every layer on the way back, or the early weights never learn."""
    net = MLP(3, [4, 4, 1])
    outputs(net([1.0, -2.0, 3.0]))[0].backward()

    first_layer = net.parameters()[: 4 * (3 + 1)]
    assert total_gradient(first_layer) > 0.0


def test_every_parameter_of_an_mlp_receives_a_gradient():
    net = MLP(3, [4, 4, 1])
    outputs(net([1.0, -2.0, 3.0]))[0].backward()
    assert all(p.grad != 0.0 for p in net.parameters())


def test_the_same_input_twice_gives_the_same_answer():
    """Nothing random happens at call time -- randomness lives in the
    weights and is used up at construction."""
    net = MLP(3, [4, 1])
    x = [0.5, -1.0, 2.0]
    assert outputs(net(x))[0].data == outputs(net(x))[0].data


def test_an_mlp_builds_one_connected_graph():
    """Every parameter must be reachable from the output, otherwise part of
    the network is not really wired in."""
    from micrograd.topo import topo

    net = MLP(2, [3, 1])
    out = outputs(net([1.0, 2.0]))[0]
    reachable = {id(n) for n in topo(out)}
    assert all(id(p) in reachable for p in net.parameters())


# ------------------------------ 4. the claim that makes training possible


def test_stepping_against_the_gradient_lowers_the_output():
    """Gradient descent in one line: `grad` says which way the output goes
    up, so moving the parameters the other way brings it down.

    Everything a training loop does is this, repeated -- with a loss in
    place of the raw output. Writing that loop is your job, not this file's.
    """
    net = MLP(3, [4, 4, 1])
    x = [1.0, -2.0, 3.0]

    before = outputs(net(x))[0]
    before.backward()

    for p in net.parameters():
        p.data -= 0.01 * p.grad

    after = outputs(net(x))[0]
    assert after.data < before.data


def test_stepping_along_the_gradient_raises_the_output():
    """The mirror image, which pins down the sign. If descent were written
    with the wrong sign this test would be the one still passing."""
    net = MLP(3, [4, 4, 1])
    x = [1.0, -2.0, 3.0]

    before = outputs(net(x))[0]
    before.backward()

    for p in net.parameters():
        p.data += 0.01 * p.grad

    after = outputs(net(x))[0]
    assert after.data > before.data


def test_a_second_forward_pass_builds_a_brand_new_graph():
    """Parameters live on between passes; everything else does not. Calling
    the network again produces different Value objects for the intermediate
    results, even though the parameters are the same ones as before.

    Worth knowing before writing the training loop.
    """
    net = MLP(2, [3, 1])
    x = [1.0, 2.0]

    first = outputs(net(x))[0]
    second = outputs(net(x))[0]

    assert first is not second
    assert first.data == second.data
    assert net.parameters()[0] is net.parameters()[0]


# ---------------------------------------------------------------------
# Not tested here on purpose:
#
#   - the training loop itself
#   - what has to happen to gradients between one step and the next
#
# Write the loop, watch the loss, and trust the numbers over your
# expectations. There is something waiting in there.
# ---------------------------------------------------------------------
