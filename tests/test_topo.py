"""Property tests for the topological order.

Skipped automatically unless `topo` is importable from micrograd.engine --
where the ordering lives is a design choice, not part of the contract. If it
ends up somewhere else, change the import here and the tests still apply.
"""

import pytest

from micrograd import engine
from micrograd.engine import Value

topo = getattr(engine, "topo", None)

pytestmark = pytest.mark.skipif(
    topo is None, reason="micrograd.engine does not expose `topo`"
)


def walk(root):
    """Collect nodes and edges independently of anything under test.

    Deliberately duplicated rather than reusing the engine's own traversal:
    a test that calls the code it is checking cannot catch that code being
    wrong. Edges point child -> parent, matching the direction gradients
    flow during the backward pass.
    """
    nodes, edges, seen = [], [], set()

    def visit(node):
        if id(node) in seen:
            return
        seen.add(id(node))
        nodes.append(node)
        for child in node._prev:
            edges.append((child, node))
            visit(child)

    visit(root)
    return nodes, edges


def diamond():
    """m feeds two branches that meet again at the root -- the smallest
    graph where a wrong order produces wrong numbers instead of luck."""
    x, y = Value(2.0), Value(3.0)
    p, q = Value(5.0), Value(7.0)
    m = x * y
    return (m * p) * (m * q)


def assert_parents_come_first(root):
    order = list(topo(root))
    nodes, edges = walk(root)

    assert len(order) == len(nodes), "each node must appear exactly once"
    assert {id(n) for n in order} == {id(n) for n in nodes}, "no node may be missing"

    position = {id(n): i for i, n in enumerate(order)}
    for child, parent in edges:
        assert position[id(parent)] < position[id(child)], (
            f"{parent.label or parent._op or parent.data} must come before "
            f"{child.label or child._op or child.data}"
        )


def test_every_parent_comes_before_its_children():
    assert_parents_come_first(diamond())


def test_the_property_holds_however_the_operands_were_ordered():
    """A DAG has many valid topological orders, so swapping m * p for p * m
    gives a different sequence that is equally correct. This is exactly why
    the check is a property and not a comparison against one expected list.
    """
    x, y = Value(2.0), Value(3.0)
    p, q = Value(5.0), Value(7.0)
    m = x * y
    assert_parents_come_first((p * m) * (q * m))


def test_it_holds_on_a_deep_chain_of_reused_nodes():
    v = Value(1.0)
    for _ in range(12):
        v = v + v
    assert_parents_come_first(v)


def test_a_single_leaf_is_already_a_valid_order():
    leaf = Value(2.0)
    assert [id(n) for n in topo(leaf)] == [id(leaf)]


def test_a_node_reached_by_two_routes_is_still_listed_once():
    """Without a visited guard this list grows past the node count, and the
    duplicates make backward() fire twice for the same node."""
    x = Value(2.0)
    y = Value(3.0)
    m = x * y
    root = (m + m) * m
    nodes, _ = walk(root)
    assert len(list(topo(root))) == len(nodes)
