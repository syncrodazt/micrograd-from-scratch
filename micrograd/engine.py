from micrograd.topo import topo
import math


class Value:
    def __init__(
        self, data: float, label: str = "", _prev: list = (), _op: str = ""
    ) -> None:
        self.data = data
        self.label = label
        self._prev = list(_prev)
        self._op = _op
        self.grad = 0.0
        self._backward = lambda: None

    def __repr__(self) -> str:
        return f"Value(data = {self.data}, label = {self.label})"

    def __add__(self, other: "Value") -> "Value":
        t = Value(self.data + other.data, _op="+", _prev=[self, other])

        def _backward():
            self.grad += t.grad
            other.grad += t.grad

        t._backward = _backward
        return t

    def __mul__(self, other: "Value") -> "Value":
        t = Value(self.data * other.data, _op="*", _prev=[self, other])

        def _backward():
            self.grad += t.grad * other.data
            other.grad += t.grad * self.data

        t._backward = _backward
        return t

    def tanh(self):
        t = Value(math.tanh(self.data), _op="tanh", _prev=[self])

        def _backward():
            self.grad += (1 - t.data**2) * t.grad
            # self.grad += 1 - t.data**2

        t._backward = _backward

        return t

    def backward(self) -> None:
        self.grad = 1.0
        order = topo(self)
        for n in order:
            n._backward()
