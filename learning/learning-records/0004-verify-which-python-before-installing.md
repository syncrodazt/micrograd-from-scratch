# 0004 — เช็คก่อนเสมอว่ากำลังคุยกับ Python ตัวไหน

**วันที่:** 2026-08-08
**สถานะ:** กฎถาวร

## บริบท

รัน `pip install pytest graphviz numpy matplotlib ipykernel` แล้วรายงานว่าลงเสร็จ
แต่ VS Code ยังบอกว่า `.venv` ไม่มี `ipykernel`

## สิ่งที่พบ

เครื่องมี Python **สามตัว**:

| Python | เวอร์ชัน | มีอะไร |
|---|---|---|
| `.venv` ของโปรเจกต์ | 3.13.13 | pip ตัวเดียว |
| system | 3.14.3 | pytest, numpy, pandas |
| conda base | — | package ที่เพิ่งลงทั้งหมด |

Anaconda ติดตั้ง hook ที่ auto-activate `base` ทุกครั้งที่เปิดเทอร์มินัลใหม่
conda จึงแย่ง `PATH` ก่อน แล้ว `pip` ที่เรียกก็คือ pip ของ conda

ผลต่อเนื่อง: `pip freeze > requirements.txt` ได้ไฟล์ของ conda base
ที่มีบรรทัด `@ file:///home/conda/feedstock_root/...` ซึ่งใช้ไม่ได้บนเครื่องใครเลย

## กฎที่ตั้งไว้

1. **ก่อนลง package ทุกครั้ง** — `python -c "import sys; print(sys.executable)"`
2. **เวลาไม่ชัวร์ ใช้ path ตรงๆ** — `.venv\Scripts\python.exe -m pip ...`
   ไม่ว่า PATH จะเละแค่ไหนก็ไม่มีทางผิดตัว
3. `pip freeze` ให้ผลตาม Python ตัวที่รันมัน — freeze ผิดตัว ได้ไฟล์ผิดทั้งไฟล์

## เรื่องเดียวกันคนละรูป

Graphviz ลงสำเร็จแต่ installer ไม่ได้ใส่ `PATH` ให้ —
`import graphviz` ผ่าน แต่พังตอน render (`ExecutableNotFound`)
เพราะ Python package กับ binary เป็นคนละอย่าง

และเมื่อแก้ `PATH` แล้วต้องปิด VS Code เปิดใหม่ทั้งโปรแกรม
ไม่ใช่แค่ restart kernel — process ที่เปิดอยู่แล้วถือ `PATH` เดิมค้างไว้
