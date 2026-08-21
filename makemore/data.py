import pathlib


def bigrams(word):
    word = "." + word + "."
    out = []
    for ch1, ch2 in zip(word, word[1:]):
        out.append((ch1, ch2))
    return out


def load_words(p=None):
    if p == None:
        words = pathlib.Path(__file__).parent.joinpath("names.txt").read_text()
    else:
        words = pathlib.Path(p).read_text()
    res = []
    for w in words.splitlines():
        if w.strip() != "":
            res.append(w.strip())
    return res


words = load_words()
chs = ["."] + sorted(set("".join(words)))
stoi = {s: i for s, i in zip(chs, range(27), strict=True)}
itos = {i: s for s, i in stoi.items()}
