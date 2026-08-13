---
name: recall
description: Retrieval practice for T's walks — with no argument, issue the four-block prompt set; with his raw answers pasted in, record them unedited and grade them. Use for "โจทย์ตอนเดิน", "จะไปเดิน/วิ่ง ถามอะไรหน่อย", or when he pastes back what he said on a walk.
---

# Retrieval practice

T identified this himself as the thing that makes the material stick:

> *ถ้าเกิดเราไม่มี session แบบนี้ ระดับความเข้าใจ ระดับ recall ของเราจะไม่ดีขนาดนี้*

Two modes, decided by whether he has already walked.

---

## Mode A — no argument: issue the prompts

Four blocks, ~30 minutes. Open with the rules:

> **ห้ามหยิบมือถือ** · ติดตรงไหนให้จำไว้ว่าติด แล้วเดินต่อ —
> **จุดที่นึกไม่ออกคือข้อมูลที่มีค่าที่สุดของทั้งทริป** ไม่ใช่ความล้มเหลว

| ช่วง | นาที | ทำอะไร |
|---|---|---|
| 1 | 0–8 | **เล่าทั้งเส้นออกเสียง** — ต้องออกเสียงจริง คิดในหัวจะข้ามรูโดยไม่รู้ตัว |
| 2 | 8–15 | **เขียนโค้ดในหัวทีละบรรทัด** ชื่อตัวแปรจริง ไม่ใช่ "ก็เก็บค่าไว้" |
| 3 | 15–24 | ⭐ **"อะไรพังถ้า…" 5–7 ข้อ** |
| 4 | 24–30 | **ออกแบบสิ่งที่จะเขียนต่อ** กลับถึงบ้านจะพิมพ์รวดเดียวจบ |

**Block 3 is the one that pays.** Draw the scenarios from bugs already hit plus the ones
waiting in the next phase. Always append: **error ขึ้น หรือเงียบแล้วให้ตัวเลขผิด?** — silent
failure is this project's running theme.

Rotate block 1 into **English** periodically, using the six-step skeleton in
`learning/reference/explaining-in-english.html`. That is the README rehearsal.

End by naming which one or two questions are worth the most, so a short walk still lands.

---

## Mode B — he pastes raw answers: record, then grade

### `learning/retrieval/<date>-recall.md` and `.html`

Match the existing pair in `learning/retrieval/`. **Do not tidy his words.** The page keeps
the state of his understanding on that date, stumbles included — that is what makes the next
round comparable. Organise under the prompt headings only. Use `.raw` for his text, `.stamp`
for the transcription note, and put any observation he made about his own learning in a
`.note good` at the top.

### `learning/retrieval/<date>-review.html`

- Verdict table first: one row per question, ✅ / 🟡 / ❌ / ⬜.
- **Run code whenever an answer could be settled by measurement.** He is convinced by
  numbers, not explanation. An answer that is right for the wrong reason must be caught —
  paste the output that shows it.
- Confirm what was right *and why the reasoning was right*, not just the conclusion.
- Answer anything he raised that was beyond the question asked — those are usually his best
  thinking and deserve a real answer.
- Compare against the previous retrieval page: fewer errors? wider coverage? deeper
  self-generated questions?
- Then link both pages from the retrieval cards in `learning/index.html`, newest first, and
  commit as `docs:`.

## Rules

- Never write the answers into the recall page. It records what he produced.
- Grade honestly. A wrong mechanism behind a right conclusion is a fail worth naming.
- Questions he invents himself are the strongest signal in the whole exercise — call them out.
