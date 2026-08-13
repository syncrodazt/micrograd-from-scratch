---
name: brief
description: Session-opening status for this repo — test count, roadmap progress, unpushed commits, and the recall question left hanging from last time. Use when T asks where things stand, what to do next, or opens a session with "ทำถึงไหนแล้ว".
---

# Session brief

Give T a scannable picture of where the project stands, then make him answer the question
left over from last session **before** any new work starts. CLAUDE.md §6 requires that.

## 1. Gather (run these, do not guess)

```bash
git status -sb | head -2                                    # branch + ahead/behind
.venv/Scripts/python.exe -m pytest -q 2>&1 | tail -1        # test count
grep -c 'type="checkbox" checked' learning/reference/roadmap.html
grep -c 'data-id=' learning/reference/roadmap.html
git log --oneline -3
```

Find the pending question: read the closing section of the newest file in
`learning/lessons/` or `learning/retrieval/` — most sessions end with one.

## 2. Report

Short. A table, not paragraphs.

- **สถานะ** — tests passing / roadmap N of M / `ahead N`
- **เฟส** — which are done, which is current, which is next
- **ก่อนเริ่ม** — the pending question, asked plainly, with a note not to open notes
- **เหลืออะไร** — the next one or two roadmap steps, with the ★ ones marked

## 3. Rules

- If `ahead > 0`, say so and tell him to push. Do not push for him.
- If tests are red, that is the whole brief. Name the failing test and stop.
- If working tree is dirty, list what is uncommitted before anything else.
- Do **not** propose starting work until the recall question is answered. If he answers it
  wrong or thinly, say so plainly and redo that piece — CLAUDE.md §6 says do not move
  forward to be nice.
- Keep it under a screen. He has read the roadmap; he needs the delta, not a summary.
