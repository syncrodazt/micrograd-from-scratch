from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from micrograd.engine import Value


def topo(root: "Value") -> list["Value"]:
    order = []
    order_set = set()

    def f(node):
        if node in order_set:
            return
        for n in node._prev:
            f(n)
        order.append(node)
        order_set.add(node)

    f(root)

    return list(reversed(order))
