# Mission

## ทำไมถึงเรียนเรื่องนี้

เปลี่ยนสายจากวิศวกรรมเครื่องกล/FA ไปเป็น ML engineer ภายใน 17 เดือน
(ส.ค. 2026 → ธ.ค. 2027) เป้าหมายคือ CADDi / Woven by Toyota / NVIDIA

micrograd คือ **M1** — เดือนแรกของทั้งหมด และเป็นฐานที่ทุกอย่างข้างบนวางอยู่

## เงื่อนไขที่ทำให้เดือนนี้สำคัญเป็นพิเศษ

| เดือน | สิ่งที่ต้องทำได้ | ต้องการอะไรจาก M1 |
|---|---|---|
| M2 (ก.ย. 2026) | เขียน `makemore` ใหม่จากศูนย์ **โดยไม่เปิดวิดีโอ** | autograd ต้องเป็นสัญชาตญาณแล้ว |
| M3 (ต.ค. 2026) | reimplement nanoGPT | เหมือนกัน + ลึกกว่า |
| M4 (พ.ย. 2026) | minimal ViT from scratch | เหมือนกัน |

ไม่มีทางโกงข้ามไปได้ — ถ้า M1 ได้แค่ "โค้ดที่ทำงานได้" แต่ rebuild เองไม่ได้ M2 จะพังทันที

## นิยามของ "เสร็จ"

ผ่านครบสามข้อเท่านั้นถึงนับว่าจบหัวข้อ:

1. **Rebuild** — เขียนใหม่ได้จากไฟล์เปล่า
2. **Explain** — อธิบายได้โดยไม่เปิดโน้ต
3. **Debug** — แก้ได้เมื่อมันพัง

เทสต์ผ่านหมดไม่ได้แปลว่าเสร็จ **โค้ดที่ทำงานได้แต่ rebuild เองไม่ได้ มีค่าเป็นศูนย์**

## ข้อจำกัดที่ตั้งไว้เอง

- โค้ดหลักทั้งหมด (`Value`, `nn.py`, training loop, makemore) **เขียนเองทุกบรรทัด**
- engine ใช้ **pure Python เท่านั้น ห้าม numpy**
- ผู้ช่วย AI ทำหน้าที่ tutor และ reviewer เท่านั้น ห้ามเขียนโค้ดหลักให้
- commit ทุกวันที่เรียน ไม่ว่าจะน้อยแค่ไหน

## พื้นฐานที่มีอยู่แล้ว

M.Eng Systems & Control, Institute of Science Tokyo (2024) —
multivariable calculus, linear algebra, ODE, state-space, control theory, optimization
เคยทำวิจัย CV/3D (multi-view geometry, RANSAC, Detectron2, depth estimation)
ใช้ PyTorch/OpenCV เป็นในฐานะ *ผู้ใช้* แต่ไม่เคยสร้าง autograd engine เอง

**สะพานที่ใช้ได้ดีที่สุด:** backprop บน computation graph ≈ adjoint/costate equation
ที่วิ่งย้อนเวลากลับ — คิดเป็น state-space ได้เลย

## เนื้อหาที่อยู่นอกขอบเขตเดือนนี้

GPU/CUDA · performance optimization · tensor-valued `Value` ·
Zero to Hero #3 ขึ้นไป · transformers · การทำให้เป็น library จริง
