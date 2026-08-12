import random
from micrograd.engine import Value


class Neuron:
    def __init__(self, nin):
        self.nin = nin
        self.ws = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))

    def __repr__(self):
        return f"Neuron(nin = {self.nin}, ws = {self.ws}, b = {self.b})"

    def parameters(self):
        return [*self.ws, self.b]

    def __call__(self, xs):
        return sum((w * x for w, x in zip(self.ws, xs, strict=True)), self.b).tanh()


class Layer:
    def __init__(self, nin, nout):
        self.nin = nin
        self.nout = nout
        self.neurons = [Neuron(nin) for _ in range(nout)]

    def __repr__(self):
        return f"Layer(nin = {self.nin}, nout = {self.nout})"

    def parameters(self):
        return [p for neuron in self.neurons for p in neuron.parameters()]

    def __call__(self, xs):
        return [neuron(xs) for neuron in self.neurons]


class MLP:
    def __init__(self, nin, neurons_per_layer):
        self.nin = nin
        self.neurons_per_layer = neurons_per_layer
        self.layers = [
            Layer(l, r) for l, r in zip([nin, *neurons_per_layer], neurons_per_layer)
        ]

    def __repr__(self):
        return f"MLP(nin = {self.nin}, neurons_per_layer = {self.neurons_per_layer})"

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]

    def __call__(self, xs):
        res = xs
        for layer in self.layers:
            res = layer(res)
        return res

    def zero_grad(self):
        for p in self.parameters():
            p.grad = 0.0

    def update(self, lr):
        for p in self.parameters():
            p.data -= lr * p.grad

    # def get_loss(self, x_gt, y_gt):
    #     