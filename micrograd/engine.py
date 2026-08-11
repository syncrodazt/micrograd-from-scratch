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
        return f"Value(data = {self.data:.4g}, label = {self.label})"

    def __add__(self, other: "Value") -> "Value":
        other = self._as_value(other)
        t = Value(self.data + other.data, _op="+", _prev=[self, other])

        def _backward():
            self.grad += t.grad
            other.grad += t.grad

        t._backward = _backward
        return t

    def __radd__(self, other):
        return self.__add__(other)

    def __mul__(self, other: "Value") -> "Value":
        other = self._as_value(other)
        t = Value(self.data * other.data, _op="*", _prev=[self, other])

        def _backward():
            self.grad += t.grad * other.data
            other.grad += t.grad * self.data

        t._backward = _backward
        return t

    def __rmul__(self, other):
        return self.__mul__(other)

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __rsub__(self, other):
        return -self.__sub__(other)

    def __pow__(self, other):
        assert isinstance(other, (int, float))
        t = Value(math.pow(self.data, other), _op=f"^{other}", _prev=[self])

        def _backward():
            self.grad += t.grad * other * math.pow(self.data, other - 1)

        t._backward = _backward
        return t

    def __truediv__(self, other):
        other = self._as_value(other)
        return self * other**-1

    def __rtruediv__(self, other):
        return (self.__truediv__(other)) ** -1

    def tanh(self):
        t = Value(math.tanh(self.data), _op="tanh", _prev=[self])

        def _backward():
            self.grad += (1 - t.data**2) * t.grad
            # self.grad += 1 - t.data**2

        t._backward = _backward

        return t

    def exp(self):
        t = Value(math.exp(self.data), _op="exp", _prev=[self])

        def _backward():
            self.grad += t.grad * t.data

        t._backward = _backward

        return t

    def backward(self) -> None:
        self.grad = 1.0
        order = topo(self)
        for n in order:
            n._backward()

    @staticmethod
    def _as_value(x):
        return x if isinstance(x, Value) else Value(x)
