---
name: spec
description: Write a failing-test contract for the next piece of work, then prove it is both satisfiable and sharp before handing it over. Use for "เขียนเทสต์ให้ก่อน", "/spec <thing>", or when starting a phase T will implement himself.
---

# Write the contract first

CLAUDE.md §2 forbids writing the core, but explicitly encourages **tests he must make pass**.
Done properly this accelerates him without taking anything: the tests say *what*, never *how*,
and `pytest -x` turns them into a build order.

This has run three times (`test_engine.py`, `test_ops.py`, `test_nn.py`). Follow the same shape.

## 1. Write `tests/test_<x>.py`

Module docstring states the run command, the promise that nothing here hints at
implementation, and any API shape the roadmap already committed to. Say what is **out of
scope on purpose** — declaring a boundary is part of the contract.

- **Order sections so each needs only the ones above it.** That makes `pytest -x` walk a
  sensible build order rather than just report failures.
- **Name tests as sentences** — a failure should read as a statement of what broke.
- **Test behaviour, not internals.** Where a design choice is genuinely his (does a
  one-output layer return `v` or `[v]`?), write a helper that accepts either and say so in
  its docstring.
- **Docstrings carry the reasoning**, especially for the subtle ones: why symmetry has to be
  broken, why a test with the operation on the outside cannot see a missing gradient factor.
- Include at least one check against a source that knows nothing about his code — a
  numerical gradient, a closed form, a second route to the same value.

## 2. Prove the spec is satisfiable

Build a throwaway implementation **in the scratchpad, never in the repo**, and run the suite
against it. A spec nobody has satisfied is a spec that may be impossible, and he would spend
hours discovering that.

If the work involves randomness, run it 8+ times — a flaky contract is worse than none.

## 3. Prove the tests have teeth

Mutate the throwaway one bug at a time and count what breaks:

```
= instead of +=              10 failed
__rsub__ backwards            3 failed
exp reads input not output    9 failed
```

Pick mutations from bugs actually hit before. **A mutation nothing catches is a hole** — go
back and add the test. Report the table; it is what makes the suite trustworthy.

## 4. Clean up and commit

- **Delete the throwaway.** It is a reference implementation and must not survive anywhere he
  could stumble on it.
- Commit only the test file, `test:` prefix. The body records what it covers and the mutation
  results.
- Run the full suite to confirm nothing existing broke.

## 5. Hand over

Show the first failure — it is the starting point:

```
E   AttributeError: 'int' object has no attribute 'data'
```

Name the sections in order, say which one is worth the most thought, and stop. Do not sketch
the implementation, not even in prose.
