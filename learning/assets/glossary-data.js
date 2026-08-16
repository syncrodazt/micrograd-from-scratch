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
  "globalkw": {
    term: "global",
    en: "global keyword",
    def: "บอก Python ว่า \"ชื่อนี้ที่ฉันกำลังจะ assign ทับ คือตัวแปรระดับไฟล์ ไม่ใช่ตัวใหม่ของฉัน\" ต่างจาก <code>nonlocal</code> ตรงที่ <strong>สร้างชื่อใหม่ขึ้นมาได้</strong> และตัวแปรนั้น <strong>มีชุดเดียวตลอดอายุโปรแกรม</strong> ใครก็เข้าถึงและเขียนทับได้"
  },
  "legb": {
    term: "LEGB",
    en: "Local → Enclosing → Global → Built-in",
    def: "ลำดับที่ Python ค้นหาชื่อตัวแปร: ในฟังก์ชันตัวเอง → ฟังก์ชันแม่ที่ครอบอยู่ → ระดับไฟล์ → ของที่ Python แถมมา (<code>len</code>, <code>print</code>) การ <em>อ่าน</em> ไล่ตามลำดับนี้อัตโนมัติ แต่การ <em>เขียนทับ</em> จะสร้างตัวใหม่ใน Local เสมอ เว้นแต่จะประกาศ <code>nonlocal</code> หรือ <code>global</code>"
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

  /* ---- calculus ---- */
  "chainrule": {
    term: "Chain rule",
    en: "chain rule (multivariable)",
    def: "กฎลูกโซ่ในรูปที่ backprop ใช้จริง: ถ้าตัวแปรหนึ่งส่งผลถึงปลายทางได้<strong>หลายเส้นทาง</strong> อนุพันธ์รวมคือ<strong>ผลบวกของทุกเส้นทาง</strong> — <code>dz/dx = ∂z/∂x + ∂z/∂w · dw/dx</code> เครื่องหมายบวกในสูตรนี้คือเหตุผลที่โค้ดต้องใช้ <code>+=</code> ไม่ใช่ <code>=</code>"
  },
  "gradaccum": {
    term: "Gradient accumulation",
    en: "gradient accumulation",
    def: "การบวกสะสม gradient ที่ node แทนการเขียนทับ จำเป็นเมื่อ node มีพ่อแม่มากกว่าหนึ่งตัว เพราะ backward pass เดินทีละ operation จึงเห็นทีละเส้นทาง แต่ละเส้นมาถึงคนละเวลา — ใช้ <code>=</code> แล้วเส้นทางหลังจะเขียนทับเส้นทางแรก โดย<strong>ไม่มี error ใดๆ</strong>"
  },

  /* ---- data structures ---- */
  "hashtable": {
    term: "Hash table",
    en: "hash table",
    def: "กลไกใต้ <code>set</code> และ <code>dict</code> — เอาค่าไปคำนวณเป็นตัวเลขก่อน แล้วใช้ตัวเลขนั้นเป็นที่อยู่ จึงกระโดดไปดูจุดเดียวได้เลย ทำให้ <code>x in c</code> เป็น O(1) ผลข้างเคียง: ของที่เปลี่ยนค่าได้เป็น key ไม่ได้ และไม่มีลำดับ"
  },
  "bigo": {
    term: "Big-O",
    en: "big-O notation",
    def: "ไม่ได้บอกว่าเร็วกี่วินาที แต่บอกว่า<strong>ช้าลงเท่าไหร่เมื่อของเยอะขึ้น</strong> — O(1) คือคงที่ไม่ว่าจะมีกี่ตัว O(n) คือแปรผันตรงกับจำนวน ส่วน <code>x in list</code> ที่เป็น O(n) คือเหตุผลที่ guard ต้องใช้ set"
  },
  "amortized": {
    term: "Amortized O(1)",
    en: "amortized constant time",
    def: "เฉลี่ยแล้วคงที่ แต่บางครั้งแพง — <code>list.append</code> ปกติแค่วางของท้ายแถว แต่พอเต็มต้องขอหน่วยความจำก้อนใหม่แล้วย้ายทั้งหมด เฉลี่ยข้ามหลายครั้งจึงยังนับเป็น O(1)"
  },
  "stack": {
    term: "Stack",
    en: "stack (LIFO)",
    def: "เอาตัวที่ใส่<strong>หลังสุด</strong>ออกก่อน · call stack ของ Python เองก็เป็น stack — <code>RecursionError</code> คืออาการที่มันเต็ม · DFS แบบไม่ recursive คือ DFS ที่ถือ stack เอง"
  },
  "queue": {
    term: "Queue",
    en: "queue (FIFO)",
    def: "เอาตัวที่ใส่<strong>ก่อนสุด</strong>ออกก่อน — สลับกับ stack · เปลี่ยนจาก stack เป็น queue ในโค้ดเดินกราฟตัวเดียวกัน จะได้ BFS แทน DFS ทันที"
  },
  "bfs": {
    term: "BFS",
    en: "breadth-first search",
    def: "เดินกราฟแบบไล่ทีละชั้นจากจุดเริ่ม ต่างจาก <span class=\"g\" data-t=\"dfs\">DFS</span> ที่ดิ่งลงลึกก่อน — โค้ดเหมือนกันทุกบรรทัด ต่างกันแค่ว่าใช้ queue หรือ stack เก็บ “ยังไม่ได้ไป”"
  },

  /* ---- arrays / tensors (makemore ขึ้นไป) ---- */
  "strides": {
    term: "Strides",
    en: "strides",
    def: "ตัวเลขที่บอกว่าต้องกระโดดกี่ช่องในหน่วยความจำเพื่อขยับ 1 ก้าวในแต่ละแกน — tensor คือบล็อกหน่วยความจำเส้นเดียว + shape + strides ตัวเลขไม่เคยถูกจัดเป็นตารางจริง ความเป็นหลายมิติทั้งหมดอยู่ในนี้ จึงเป็นเหตุผลที่ <code>view</code> และ <code>transpose</code> ไม่ copy อะไรเลย"
  },
  "broadcast": {
    term: "Broadcasting",
    en: "broadcasting",
    def: "กฎที่ทำให้ array คนละ shape บวก/คูณกันได้ กลไกจริงคือ<strong>แกล้งทำเป็นว่าแกนนั้นมี stride = 0</strong> (ก้าวแล้วอยู่ที่เดิม) จึงไม่ copy ข้อมูล — และเป็นที่มาของบั๊กเงียบที่พบบ่อยที่สุดใน makemore"
  },
  "gather": {
    term: "Gather / embedding lookup",
    en: "gather",
    def: "<code>C[X]</code> — ไล่หยิบแถวตาม index ไปวางในบล็อกใหม่ ไม่ใช่การคูณเมทริกซ์ · backward ของมันคือ <strong>scatter-add</strong> ซึ่งต้อง<em>บวก</em>เพราะแถวเดียวอาจถูกหยิบหลายครั้งใน batch เดียว — เหตุผลเดียวกับที่ <code>_backward</code> ใช้ <code>+=</code>"
  },
  "zerograd": {
    term: "zero_grad",
    en: "zeroing the gradients",
    def: "การล้าง <code>grad</code> ของทุก node ให้เป็นศูนย์ก่อนเริ่ม backward รอบใหม่ จำเป็นเพราะ <code>backward()</code> รีเซ็ตให้แค่ root ส่วนที่เหลือใช้ <code>+=</code> จึงสะสมข้ามรอบ — เอนจินจงใจไม่ล้างให้เอง เพราะบางครั้งการสะสมข้ามหลาย backward คือสิ่งที่ต้องการ (batch ใหญ่เกินหน่วยความจำ) PyTorch เลือกแบบเดียวกัน จึงมี <code>optimizer.zero_grad()</code> เป็นคำสั่งแยก"
  },
  "mutation": {
    term: "Mutation testing",
    en: "mutation testing",
    def: "จงใจใส่บั๊กเข้าไปในโค้ดทีละตัว แล้วนับว่าเทสต์พังกี่ข้อ — ถ้าไม่พังเลยแปลว่าเทสต์ชุดนั้นมองไม่เห็นบั๊กประเภทนั้น <strong>เทสต์ที่เขียวเสมอไม่ว่าโค้ดจะเป็นยังไง ก็ไม่ต่างจากไม่มีเทสต์</strong>"
  },
  "syspath": {
    term: "sys.path",
    en: "sys.path",
    def: "รายการโฟลเดอร์ที่ Python ไล่หาโมดูลตามลำดับตอน <code>import</code> — <code>python -m</code> ใส่ <em>โฟลเดอร์ปัจจุบัน</em> ไว้ต้นรายการ ส่วนการรันไฟล์ตรงๆ ใส่ <em>โฟลเดอร์ของไฟล์นั้น</em> ความต่างนี้คือเหตุผลที่ <code>from topo import topo</code> ไม่ผ่านแต่ <code>from micrograd.topo import topo</code> ผ่าน"
  },
  "circular": {
    term: "Circular import",
    en: "circular import",
    def: "A import B ระหว่างที่ B ก็กำลัง import A — โมดูลแรกยังรันไม่จบ ชื่อที่อยู่ใต้บรรทัดปัจจุบันจึงยังไม่มีตัวตน ได้ <code>partially initialized module</code> ทางออกคือทำให้ไม่ต้อง import จริงตอนรัน: ใส่ annotation เป็น string หรือ <code>if TYPE_CHECKING:</code>"
  },
  "origin": {
    term: "origin / origin/main",
    en: "remote and remote-tracking branch",
    def: "<code>origin</code> คือชื่อเล่นของ URL ปลายทาง ส่วน <code>origin/main</code> คือ pointer <em>ในเครื่องเรา</em> ที่จำว่าตอนคุยกับ remote ครั้งล่าสุด main ฝั่งโน้นอยู่ตรงไหน — มันคือ estimate ที่อัปเดตเฉพาะตอน fetch/pull/push เท่านั้น"
  }
  ,
  /* ---- makemore ---- */
  "onehot": {
    term: "One-hot encoding",
    en: "one-hot encoding",
    def: "แทนหมวดหมู่ด้วยเวกเตอร์ที่เป็น 1 อยู่ช่องเดียว ที่เหลือเป็น 0 — เพราะการใส่ index ตรงๆ จะยัด<strong>ลำดับและขนาดปลอม</strong>เข้าไป (ทำให้ <code>e</code> ดูมากกว่า <code>a</code> ห้าเท่า) สิ่งที่ต้องเห็นให้ได้: <code>one_hot(i) @ W</code> <strong>คือแถวที่ <code>i</code> ของ <code>W</code> ตรงๆ</strong> ไม่ใช่การคูณ จึงเป็น <span class='g' data-t='gather'>gather</span> ที่เขียนในรูปการคูณเมทริกซ์"
  },
  "softmax": {
    term: "Softmax",
    en: "softmax",
    def: "แปลงเลขชุดหนึ่ง (<span class='g' data-t='logit'>logit</span>) ให้เป็นความน่าจะเป็น สองขั้น: <code>exp</code> ทำให้เป็นบวกทุกตัว แล้วหารด้วยผลรวมเพื่อให้บวกกันได้ 1 — คิดง่ายๆ ว่า <code>exp</code> เปลี่ยน logit กลับเป็น “จำนวนนับ” แล้วการหารคือการทำให้เป็นสัดส่วน"
  },
  "logit": {
    term: "Logit",
    en: "logit",
    def: "ค่าดิบก่อนเข้า softmax ติดลบได้ ไม่มีขอบเขต — ตีความว่าเป็น <strong>log ของจำนวนนับ</strong> เพราะ <code>exp</code> จะแปลงมันกลับเป็นจำนวนนับพอดี"
  },
  "likelihood": {
    term: "Likelihood",
    en: "likelihood",
    def: "นิพจน์เดียวกับ probability แต่<strong>ถือคนละตัวแปรไว้คงที่</strong> — probability ตรึงพารามิเตอร์แล้วถามถึงข้อมูล ส่วน likelihood ตรึง<em>ข้อมูลที่เห็นแล้ว</em> แล้วถามว่าพารามิเตอร์ชุดไหนทำให้ข้อมูลนี้น่าเกิด นั่นคือเหตุผลที่ maximize มันเทียบกับพารามิเตอร์ได้ แต่มันไม่ใช่ความน่าจะเป็นของพารามิเตอร์"
  },
  "crossentropy": {
    term: "Cross-entropy / NLL",
    en: "negative log likelihood",
    def: "loss ของงานทำนายความน่าจะเป็น: เอา log ของความน่าจะเป็นที่โมเดลให้กับ<em>คำตอบที่ถูก</em> มาเฉลี่ยแล้วใส่ลบ · log เปลี่ยนการคูณกันยาวๆ ให้เป็นการบวก และเครื่องหมายลบทำให้ “ยิ่งน้อยยิ่งดี” · ต่ำสุดคือ 0 เมื่อทำนายถูกด้วยความมั่นใจเต็ม"
  },
  "smoothing": {
    term: "Smoothing / regularization",
    en: "smoothing",
    def: "กันไม่ให้ความน่าจะเป็นเป็นศูนย์พอดี เพราะ <code>log(0) = −∞</code> ทำให้ loss ระเบิด · ฝั่งนับใช้บวก 1 เข้าไปทุกช่อง ฝั่ง neural ใช้บวก <code>0.01*(W**2).mean()</code> เข้าไปใน loss — <strong>สองอันนี้คือสิ่งเดียวกัน</strong> ทั้งคู่ดันการแจกแจงเข้าหาแบบสม่ำเสมอ"
  }
};
