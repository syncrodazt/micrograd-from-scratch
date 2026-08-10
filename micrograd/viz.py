# os.environ["PATH"] += os.pathsep + r"C:\\Program Files\\Graphviz\\bin"
from graphviz import Digraph

from micrograd.engine import Value

Edge = tuple[Value, Value]


def trace(root: Value) -> tuple[set[Value], set[Edge]]:
    nodes = set()
    edges = set()

    def f(node):
        if node in nodes:
            return
        nodes.add(node)
        for n in node._prev:
            f(n)
            edges.add((n, node))

    f(root)

    return nodes, edges


def plot_graph(root: Value) -> Digraph:
    nodes, edges = trace(root)
    g = Digraph(format="svg", graph_attr={"rankdir": "LR"})  # LR = ซ้ายไปขวา
    for n in nodes:
        g.node(
            name=str(id(n)),
            label=f"{{{n.label} | {n.data:.4g} | grad: {n.grad:.4g}}}",
            shape="record",
        )
        if n._op != "":
            g.node(name=str(id(n)) + n._op, label=n._op, shape="circle")
            g.edge(str(id(n)) + n._op, str(id(n)))

    for e in edges:
        child, parent = e
        g.edge(str(id(child)), str(id(parent)) + parent._op)

    return g
