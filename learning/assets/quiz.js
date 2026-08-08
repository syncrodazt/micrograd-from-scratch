/* Reusable multiple-choice quiz.

   A lesson declares its questions before loading this file:

     <div id="quiz"></div>
     <script>
     window.QUIZ = [
       { q: "คำถาม",
         opts: ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3"],
         a: 0,                                   // index ใน opts ที่ถูก
         why: "อธิบายว่าทำไม" }
     ];
     </script>
     <script src="../assets/quiz.js"></script>

   Options are shuffled on every render so position carries no information.
   Answering locks that question and reveals the explanation immediately. */

(function () {
  "use strict";

  var LETTERS = ["A", "B", "C", "D", "E"];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function build(host, items) {
    host.innerHTML = "";
    host.className = "quiz";

    var answered = 0;
    var right = 0;

    /* ---- header ---- */
    var head = document.createElement("div");
    head.className = "quiz-head";
    var label = document.createElement("span");
    label.className = "qh-label";
    label.textContent = "ตอบให้ได้ก่อนไปต่อ";
    var score = document.createElement("span");
    score.className = "quiz-score";
    head.appendChild(label);
    head.appendChild(score);
    host.appendChild(head);

    function paintScore() {
      score.textContent = right + " / " + items.length +
        (answered < items.length ? "  ·  เหลือ " + (items.length - answered) : "");
    }

    /* ---- footer ---- */
    var foot = document.createElement("div");
    foot.className = "quiz-foot";
    var verdict = document.createElement("span");
    verdict.className = "quiz-verdict";
    var reset = document.createElement("button");
    reset.className = "quiz-reset";
    reset.type = "button";
    reset.textContent = "สลับตัวเลือกแล้วลองใหม่";
    reset.addEventListener("click", function () {
      build(host, items);
      host.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    foot.appendChild(verdict);
    foot.appendChild(reset);

    function finish() {
      if (answered < items.length) return;
      var pct = right / items.length;
      verdict.textContent =
        pct === 1     ? "เต็ม — ข้อนี้ผ่านแล้ว ไปบทถัดไปได้" :
        pct >= 0.6    ? "ผ่านแบบมีรูรั่ว — อ่านคำอธิบายข้อที่พลาดอีกรอบ" :
                        "ยังไม่ผ่าน — กลับไปอ่านหัวข้อด้านบนแล้วลองใหม่";
      verdict.style.color =
        pct === 1 ? "var(--ok)" : pct >= 0.6 ? "var(--ink-soft)" : "var(--bad)";
    }

    /* ---- questions ---- */
    items.forEach(function (item, qi) {
      var card = document.createElement("div");
      card.className = "q";

      var num = document.createElement("div");
      num.className = "q-num";
      num.textContent = "ข้อ " + (qi + 1) + " / " + items.length;

      var text = document.createElement("div");
      text.className = "q-text";
      text.innerHTML = item.q;

      var opts = document.createElement("div");
      opts.className = "q-opts";

      var why = document.createElement("div");
      why.className = "q-why";
      why.innerHTML = item.why;

      /* keep the correct option identifiable after shuffling */
      var pairs = item.opts.map(function (o, i) {
        return { text: o, ok: i === item.a };
      });

      var buttons = [];

      shuffle(pairs).forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "opt";

        var kbd = document.createElement("span");
        kbd.className = "kbd";
        kbd.textContent = LETTERS[i] || "?";

        var span = document.createElement("span");
        span.className = "otext";
        span.innerHTML = p.text;

        var mark = document.createElement("span");
        mark.className = "mark";
        mark.textContent = p.ok ? "✓" : "✕";

        b.appendChild(kbd);
        b.appendChild(span);
        b.appendChild(mark);

        b.addEventListener("click", function () {
          buttons.forEach(function (o) {
            o.el.disabled = true;
            if (o.ok) o.el.classList.add("correct");
            else if (o.el !== b) o.el.classList.add("dim");
          });
          if (!p.ok) b.classList.add("wrong");
          why.classList.add("on");
          card.classList.add("done");

          answered++;
          if (p.ok) right++;
          paintScore();
          finish();
        });

        buttons.push({ el: b, ok: p.ok });
        opts.appendChild(b);
      });

      card.appendChild(num);
      card.appendChild(text);
      card.appendChild(opts);
      card.appendChild(why);
      host.appendChild(card);
    });

    host.appendChild(foot);
    paintScore();
  }

  function boot() {
    var host = document.getElementById("quiz");
    if (!host || !window.QUIZ || !window.QUIZ.length) return;
    build(host, window.QUIZ);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
