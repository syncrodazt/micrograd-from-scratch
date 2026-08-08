/* Shared glossary. Every lesson links terms here via <span class="g" data-t="key">.
   Keep `key` stable - lessons reference it. Definitions in Thai, terms in English. */

window.GLOSSARY = {

  /* ---- graph / autodiff ---- */
  "compgraph": {
    term: "Computation graph",
    en: "computation graph",
    def: "โครงสร้างข้อมูลที่บันทึกว่าค่าแต่ละตัว <em>เกิดจากอะไร</em> ไม่ใช่แค่ค่าเป็นเท่าไหร่ สร้างขึ้นระหว่างที่คำนวณไปข้างหน้า (forward pass) เพื่อให้เดินย้อนกลับหา gradient ได้ทีหลัง"
  },
  "dag": {
    term: "DAG",
    en: "directed acyclic graph",
    def: "กราฟที่ลูกศรมีทิศทาง และไม่มีทางเดินวนกลับมาที่เดิม จุดสำคัญคือ node หนึ่งตัว <strong>มีพ่อแม่ได้หลายตัว</strong> ต่างจาก tree นี่คือรูปทรงจริงของ computation graph"
  },
  "tree": {
    term: "Tree",
    en: "tree",
    def: "กราฟที่ทุก node มีพ่อแม่ได้ไม่เกิน 1 ตัว ไม่มีการมาบรรจบกัน ถ้าตัวแปรถูกใช้ซ้ำ (เช่น <code>x*y + x</code>) โครงสร้างจะไม่ใช่ tree อีกต่อไป"
  },
  "node": {
    term: "Node",
    en: "node / vertex",
    def: "จุดหนึ่งจุดในกราฟ ในที่นี้คือ <code>Value</code> หนึ่ง object — object คนละก้อนคือคนละ node เสมอ แม้ค่าจะเท่ากัน"
  },
  "edge": {
    term: "Edge",
    en: "edge",
    def: "ลูกศรหนึ่งเส้นที่เชื่อมสอง node เก็บเป็น tuple <code>(ลูก, พ่อ)</code> ได้ ทิศจากลูกไปพ่อคือทิศของ forward pass และ gradient จะไหลสวนทางนี้"
  },
  "leaf": {
    term: "Leaf",
    en: "leaf node",
    def: "node ที่ไม่มีลูก คือค่าที่ถูกสร้างขึ้นตรงๆ ไม่ได้เกิดจากการคำนวณ (<code>Value(2.0)</code>) ในโมเดลจริงคือ input และ parameter"
  },
  "toposort": {
    term: "Topological sort",
    en: "topological sort",
    def: "การเรียง node ของ DAG ให้ทุก node มาหลังลูกของมันเสมอ จำเป็นสำหรับ backward pass เพราะต้องรู้ gradient ของ node ปลายทางก่อนจึงจะส่งย้อนเข้าไปข้างในได้"
  },
  "autodiff": {
    term: "Reverse-mode autodiff",
    en: "reverse-mode automatic differentiation",
    def: "วิธีหา gradient ของ output หนึ่งตัวเทียบกับ input ทุกตัว โดยเดินย้อนกราฟกลับทีเดียวจบ — ไม่ใช่การหาสูตรอนุพันธ์เชิงสัญลักษณ์ และไม่ใช่การประมาณด้วยตัวเลข มันคือปัญหาเรื่อง<em>โครงสร้างข้อมูล</em> มากกว่าปัญหาแคลคูลัส"
  },
  "numgrad": {
    term: "Numerical gradient",
    en: "finite difference",
    def: "ประมาณอนุพันธ์ด้วย <code>(f(x+h) - f(x)) / h</code> ใช้ตรวจคำตอบได้ แต่ใช้เทรนจริงไม่ได้ เพราะต้องคำนวณ f ใหม่หนึ่งครั้งต่อพารามิเตอร์หนึ่งตัว และมี error จากเลขทศนิยม"
  },

  /* ---- recursion ---- */
  "recursion": {
    term: "Recursion",
    en: "recursion",
    def: "ฟังก์ชันที่เรียกตัวเอง ใช้กับปัญหาที่ทุกชั้นมีรูปแบบเหมือนกันแต่ไม่รู้ล่วงหน้าว่ามีกี่ชั้น เคล็ดลับคือ <strong>อย่าไล่การทำงานในหัว</strong> ให้ตรวจแค่ว่า base case ถูก และถ้าลูกถูกแล้วพ่อถูก — เหมือนพิสูจน์แบบ induction"
  },
  "basecase": {
    term: "Base case",
    en: "base case / recursive case",
    def: "base case คือเคสที่ตอบได้ทันทีโดยไม่ต้องเรียกตัวเองซ้ำ recursive case คือเคสที่ต้องถามลูกก่อน ทั้งสองต้อง<strong>คืนของชนิดเดียวกัน</strong> ไม่งั้นจะเจอบั๊กที่หายาก"
  },
  "dfs": {
    term: "Depth-first search",
    en: "DFS",
    def: "วิธีเดินกราฟที่ลงลึกให้สุดก่อนแล้วค่อยถอยกลับมาเดินกิ่งถัดไป เขียนด้วย recursion ได้ง่ายที่สุด ต้องมีตัวจำว่า node ไหนเคยไปแล้วเพื่อไม่ให้เดินซ้ำ"
  },
  "closure": {
    term: "Closure",
    en: "closure",
    def: "ฟังก์ชันที่นิยามอยู่ข้างในฟังก์ชันอื่น และ<strong>จำตัวแปร local ของตัวนอกติดตัวไปด้วย</strong> ชื่อมาจากการที่ Python \"ปิด\" (close over) ตัวแปรลอยเหล่านั้นให้ ตรวจของจริงได้ที่ <code>f.__closure__</code>"
  },
  "freevar": {
    term: "Free variable",
    en: "free variable",
    def: "ชื่อที่ฟังก์ชันใช้ แต่ไม่ได้นิยามเองและไม่ได้รับมาเป็น argument ฟังก์ชันที่มีตัวแปรแบบนี้เรียกว่า \"เปิด\" จนกว่า Python จะผูกมันเข้ากับ scope ข้างนอกให้ ดูรายชื่อได้ที่ <code>f.__code__.co_freevars</code>"
  },
  "nonlocal": {
    term: "nonlocal",
    en: "nonlocal keyword",
    def: "บอก Python ว่า \"ชื่อนี้ที่ฉันกำลังจะ assign ทับ คือตัวแปรของฟังก์ชันข้างนอก ไม่ใช่ตัวใหม่ของฉัน\" จำเป็นเฉพาะตอนใช้ <code>=</code> หรือ <code>+=</code> — ถ้าแค่ <code>.append()</code> หรือ <code>.add()</code> ไม่ต้องใช้ เพราะนั่นคือการแก้ของในกล่อง ไม่ใช่การเปลี่ยนกล่อง"
  },
  "sideeffect": {
    term: "Side effect",
    en: "side effect",
    def: "ผลที่ฟังก์ชันทำต่อสิ่งที่อยู่นอกตัวมันเอง เช่นเติมของลง list ที่แชร์กันอยู่ ตรงข้ามกับการคืนค่าขึ้นไปให้ผู้เรียก — recursion เขียนได้ทั้งสองแบบและให้ผลเหมือนกัน แต่วิธีคิดต่างกันคนละเรื่อง"
  },

  /* ---- python ---- */
  "dunder": {
    term: "Dunder method",
    en: "double underscore method",
    def: "เมธอดชื่อขึ้นต้นและลงท้ายด้วย <code>__</code> ที่ Python เรียกให้เองเมื่อเจอ syntax ที่ตรงกัน เช่น <code>a + b</code> กลายเป็น <code>a.__add__(b)</code> — เราไม่เรียกมันเอง เราแค่เขียนไว้"
  },
  "opoverload": {
    term: "Operator overloading",
    en: "operator overloading",
    def: "การทำให้ object ของเราใช้กับเครื่องหมาย <code>+ - * /</code> ได้ ด้วยการเขียน dunder method นี่คือกลไกที่ทำให้ <code>a * b + c</code> สร้าง computation graph ขึ้นมาโดยที่โค้ดหน้าตายังเหมือนเลขคณิตธรรมดา"
  },
  "repr": {
    term: "__repr__",
    en: "repr",
    def: "เมธอดที่ตอบว่า object นี้ควรถูกแสดงเป็นข้อความอย่างไร เป็นตัวที่ notebook เรียกเมื่อพิมพ์ชื่อตัวแปรเฉยๆ ถ้าไม่เขียนจะได้ <code>&lt;__main__.Value object at 0x...&gt;</code> ซึ่งดีบักไม่ได้เลย"
  },
  "reflected": {
    term: "Reflected operator",
    en: "reflected / right-hand operator",
    def: "<code>__radd__</code>, <code>__rmul__</code> ฯลฯ Python เรียกใช้เมื่อฝั่งซ้ายตอบว่าทำไม่ได้ เช่น <code>3 * a</code> จะถาม <code>int</code> ก่อน พอ int ไม่รู้จัก จึงย้อนมาถาม <code>a.__rmul__(3)</code> อาการ \"สลับข้างแล้วพัง\" คือสัญญาณว่าขาดตัวนี้"
  },
  "mutdefault": {
    term: "Mutable default argument",
    en: "mutable default argument",
    def: "กับดักคลาสสิกของ Python — ค่า default ถูกสร้าง<strong>ครั้งเดียวตอนอ่านบรรทัด <code>def</code></strong> ไม่ใช่ทุกครั้งที่เรียก ทำให้ <code>def f(x, bucket=[])</code> แชร์ list ก้อนเดียวกันทุกครั้ง ใช้ <code>()</code> หรือ <code>None</code> แทน"
  },
  "identity": {
    term: "id() / identity",
    en: "object identity",
    def: "<code>id(x)</code> คืนเลขประจำตัวที่ไม่ซ้ำกันในบรรดา object ที่ยังมีชีวิตอยู่พร้อมกัน ตอบคำถามว่า \"นี่คือ object ก้อนไหน\" ต่างจาก <code>hash()</code> ที่ตอบว่า \"อะไรที่เท่ากันต้องได้ค่าเท่ากัน\" — ใช้ผิดตัวแล้วกราฟจะยุบ node ที่ค่าเท่ากันเข้าด้วยกัน"
  },
  "hashable": {
    term: "Hashable",
    en: "hashable",
    def: "object ที่เอาไปใส่ <code>set</code> หรือใช้เป็น key ของ <code>dict</code> ได้ class ทั่วไป hashable โดยอัตโนมัติ แต่<strong>เมื่อไหร่ที่เขียน <code>__eq__</code> Python จะถอด <code>__hash__</code> ออกทันที</strong> แล้วจะเจอ <code>TypeError: unhashable type</code>"
  },
  "setpy": {
    term: "set",
    en: "Python set",
    def: "โครงสร้างที่เก็บของแบบไม่ซ้ำ เพิ่มด้วย <code>.add()</code> ไม่ใช่ <code>.append()</code> เช็คว่ามีอยู่แล้วหรือยังได้เร็วมาก แต่<strong>ไม่มีลำดับ</strong> — ต่างจาก <code>dict</code> ที่รับประกันลำดับที่ใส่ตั้งแต่ Python 3.7"
  },

  /* ---- toolchain ---- */
  "venv": {
    term: "venv",
    en: "virtual environment",
    def: "โฟลเดอร์ที่มี <code>site-packages</code> ของตัวเอง ทำให้ package ของโปรเจกต์นี้ไม่ปนกับ Python ตัวอื่นในเครื่อง การ activate คือแค่แก้ <code>PATH</code> ให้ชี้มาที่นี่ก่อน"
  },
  "pythonm": {
    term: "python -m",
    en: "the -m flag",
    def: "สั่งให้ Python หา module ด้วยกลไก import ปกติแล้วรันมันในฐานะ <code>__main__</code> ความต่างสำคัญคือมันใส่ <em>โฟลเดอร์ปัจจุบัน</em> ลง <code>sys.path</code> (ต่างจากการรันไฟล์ตรงๆ ที่ใส่โฟลเดอร์ของไฟล์) และมันการันตีว่าใช้ Python ตัวที่เราเจาะจง"
  },
  "path": {
    term: "PATH",
    en: "PATH environment variable",
    def: "รายชื่อโฟลเดอร์ที่ระบบใช้ค้นหาโปรแกรมเมื่อพิมพ์ชื่อสั้นๆ process ที่เปิดอยู่แล้วจะถือ PATH เดิมค้างไว้ — เพราะงั้นติดตั้งโปรแกรมใหม่แล้วต้องเปิดเทอร์มินัล (หรือ VS Code) ใหม่"
  },
  "staging": {
    term: "Staging area",
    en: "staging area / index",
    def: "พื้นที่กลางระหว่างไฟล์บนดิสก์กับประวัติถาวร <code>git add</code> <strong>คัดลอกเนื้อไฟล์ ณ วินาทีนั้น</strong>เข้ามาที่นี่ ถ้าแก้ไฟล์ต่อโดยไม่ add ซ้ำ commit จะได้เวอร์ชันเก่า ตรวจด้วย <code>git diff --staged</code> ก่อน commit เสมอ"
  },
  "amend": {
    term: "git commit --amend",
    en: "amend",
    def: "สร้าง commit ใหม่แทนที่ตัวล่าสุด แล้วเลื่อน pointer ของ branch มาชี้ตัวใหม่ — commit เก่าไม่ได้ถูกแก้ (commit แก้ไม่ได้) แค่ไม่มีใครชี้ถึงแล้ว ปลอดภัยเฉพาะกับ commit ที่<strong>ยังไม่ push</strong>"
  },
  "origin": {
    term: "origin / origin/main",
    en: "remote and remote-tracking branch",
    def: "<code>origin</code> คือชื่อเล่นของ URL ปลายทาง ส่วน <code>origin/main</code> คือ pointer <em>ในเครื่องเรา</em> ที่จำว่าตอนคุยกับ remote ครั้งล่าสุด main ฝั่งโน้นอยู่ตรงไหน — มันคือ estimate ที่อัปเดตเฉพาะตอน fetch/pull/push เท่านั้น"
  }
};
