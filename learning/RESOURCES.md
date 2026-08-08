# Resources

แหล่งที่ใช้จริงและตรวจแล้วว่าเชื่อถือได้ เรียงตามความสำคัญในแต่ละหมวด

## หลัก — micrograd

| แหล่ง | ประเภท | ทำไมเชื่อถือได้ |
|---|---|---|
| [The spelled-out intro to neural networks and backpropagation: building micrograd](https://www.youtube.com/watch?v=VMj-3S1tku0) | วิดีโอ 2h25m | ผู้เขียน micrograd เอง — Karpathy (OpenAI founding member, ex-Director of AI ที่ Tesla, ผู้สอน CS231n) |
| [karpathy/micrograd](https://github.com/karpathy/micrograd) | source | โค้ดต้นฉบับ ~150 บรรทัด **ห้ามเปิดจนกว่าจะเขียนเองเสร็จ** |
| [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) | หลักสูตร | หน้ารวมทั้งซีรีส์ ใช้ดูลำดับ M1→M4 |

## Python — ภาษาและกลไก

| แหล่ง | ใช้ตอนไหน |
|---|---|
| [Python Data Model — special method names](https://docs.python.org/3/reference/datamodel.html#special-method-names) | รายชื่อ dunder ทั้งหมด รวม reflected operator |
| [Python Reference — binding of names](https://docs.python.org/3/reference/executionmodel.html#binding-of-names) | scope, closure, `nonlocal` — ต้นฉบับจริง ไม่ใช่บล็อก |
| [`object.__hash__` และผลของการเขียน `__eq__`](https://docs.python.org/3/reference/datamodel.html#object.__hash__) | เหตุผลที่ `Value` จะ unhashable ถ้าเขียน `__eq__` |
| [Python docs — `-m` flag](https://docs.python.org/3/using/cmdline.html#cmdoption-m) | พฤติกรรมของ `sys.path` |

## Toolchain

| แหล่ง | ใช้ตอนไหน |
|---|---|
| [Brett Cannon — Why you should use `python -m pip`](https://snarky.ca/why-you-should-use-python-m-pip/) | เขียนโดย CPython core developer อธิบายเหตุผลที่แท้จริง |
| [pytest — calling through `python -m pytest`](https://docs.pytest.org/en/stable/how-to/usage.html#calling-pytest-through-python-m-pytest) | แก้ปัญหา import ไม่เจอในเทสต์ |
| [Pro Git — Git Internals: Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) | ทำไม commit ถึง immutable และ amend ทำงานยังไงจริงๆ |
| [graphviz Python package docs](https://graphviz.readthedocs.io/) | API ของ `Digraph` |
| [IPython — integrating your objects with the rich display system](https://ipython.readthedocs.io/en/stable/config/integrating.html) | กลไก `_repr_svg_` ที่ทำให้รูปโผล่ในโน้ตบุ๊ก |

## ตรวจคำตอบ

| แหล่ง | ใช้ตอนไหน |
|---|---|
| [PyTorch autograd mechanics](https://pytorch.org/docs/stable/notes/autograd.html) | เทียบ gradient ที่คำนวณเองกับของจริง (สัปดาห์ที่ 2) |

## ชุมชน — สำหรับตอนติดจริงหรืออยากได้มุมคนอื่น

| ที่ไหน | เหมาะกับ |
|---|---|
| [r/learnmachinelearning](https://www.reddit.com/r/learnmachinelearning/) | คำถามเชิงแนวคิด คนตอบเป็นผู้เรียนด้วยกัน |
| [GitHub Discussions ของ karpathy/nn-zero-to-hero](https://github.com/karpathy/nn-zero-to-hero/discussions) | คำถามเฉพาะของหลักสูตรนี้ คนที่ทำแบบเดียวกันอยู่ |
| [Python Discord](https://discord.gg/python) | คำถาม Python ล้วน ตอบเร็ว |

> ยังไม่ได้เข้าร่วมชุมชนไหน — เก็บไว้ใช้ตอนติดนานเกิน 1 วัน
> หรือตอนอยากให้คนอื่นรีวิว README ตอนปลายเดือน
