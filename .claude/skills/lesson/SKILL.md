---
name: lesson
description: Write today's lesson page into learning/lessons/ — one theme, real measured numbers, a quiz, wired into the index and roadmap, then committed. Use when T asks to write up what was learned today, "สร้าง lesson", or wants the session recorded.
---

# Write today's lesson

The lessons are the most valuable thing in this repo — see
`learning/reference/why-deliverables.html`. Their value is the record of **bugs and how they
were chased**, not the working code. Karpathy cannot write that, having not been confused in
ten years.

## 1. Find out what actually happened

```bash
git log --oneline -8
git log --format=%B -1 <last feat/fix commit>     # the body carries the reasoning
git diff <last docs: commit>..HEAD --stat
```

Then read back through the conversation for: what confused him, what he predicted wrongly,
what got measured, and the questions he raised himself. Those are the lesson.

## 2. Write `learning/lessons/00NN-<slug>.html`

Match the existing pages exactly — read the newest one first. Structure:
`<meta>` block, `.crumbs`, `.masthead` with `.kicker` / `<h1>` / `.standfirst` / `.meta`,
then `<h2>` sections, `<div id="quiz">`, `.src`, `.ask`, `.footer` with `.pager`,
then the three scripts and the `window.QUIZ` block.

**Rules that make these worth reading:**

- **One theme per lesson.** Pick the single idea that ties the day together and cut the rest.
- **Every number comes from a real run.** If you cite a timing, a node count, a gradient —
  run it first and paste the output. Never estimate. This is the one thing T trusts.
- **Quote him.** His own confused sentence at the top of a section is worth more than any
  explanation of it.
- **Name the bug category, then the mechanism.** "ผิดแบบเงียบ" is the running theme of this
  repo — say when a bug throws nothing.
- Thai prose, English technical terms, `<code>` for identifiers.
- Link glossary terms with `<span class="g" data-t="key">` — check `assets/glossary-data.js`
  first; add new entries there if a term is genuinely new.

## 3. Quiz — 6 to 8 questions

`window.QUIZ = [{q, opts, a, why}]`. The quiz is where the lesson gets tested, so:

- **All options roughly the same length.** A long correct answer among short wrong ones is a
  free giveaway.
- **Distractors must be real misconceptions** — ideally ones T actually voiced. Never absurd.
- `why` explains the mechanism and says why the tempting wrong answer is tempting.
- Prefer "what breaks if…" over "what is…".

## 4. Wire it in

- Update the previous lesson's `.pager` to point forward to this one.
- Add a `.card` to `learning/index.html` in the lessons section.
- Tick the roadmap steps this covers — **never change an existing `data-id`**, they key the
  saved progress and timers in localStorage.
- Update the status table and `sec-note` date in `index.html`.

## 5. Commit

Separate commit from the code. `docs:` for the lesson, `feat:` for the implementation —
staging both together produces a message that lies about half its contents. Body explains
what the lesson records and why it mattered.

Verify `python -m pytest -q` still passes and `node --check` any JS touched.
