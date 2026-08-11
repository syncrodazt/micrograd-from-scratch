/* Per-task stopwatch for the roadmap checklist.

   Sits on top of progress.js (which owns the done/not-done state) and adds
   "how long did this step actually take". Load it AFTER progress.js:

     <script src="../assets/progress.js"></script>
     <script src="../assets/timer.js"></script>

   State lives in localStorage under `time:<data-track>`, separate from the
   `track:<data-track>` key progress.js uses, so ticking boxes still works
   with this file removed.

   Shape, per task id:
     { elapsed: <ms accumulated while paused>,
       since:   <epoch ms of the current running span, or null>,
       first:   <epoch ms the stopwatch was first started>,
       end:     <epoch ms the box was ticked> }

   Pausing matters: a dinner break in the middle of a step should not be
   counted as study time, so the button toggles and the spans accumulate. */

(function () {
  "use strict";

  var TICK_MS = 15000; /* repaint running timers */

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function hm(ts) {
    var d = new Date(ts);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function ymd(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function dur(ms) {
    var mins = Math.floor(ms / 60000);
    if (mins < 1) return "< 1 นาที";
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h === 0) return m + " นาที";
    if (m === 0) return h + " ชม.";
    return h + " ชม. " + m + " นาที";
  }

  /* Accepts what a tired person actually types: 90, 90m, 1.5h, 1h30, 1:30.
     Returns milliseconds, or null if it makes no sense. */
  function parseDuration(text) {
    var s = String(text == null ? "" : text).trim().toLowerCase().replace(/\s+/g, "");
    if (!s) return null;
    var m;
    if ((m = s.match(/^(\d+):(\d{1,2})$/))) return (+m[1] * 60 + +m[2]) * 60000;
    if ((m = s.match(/^(\d+(?:\.\d+)?)h(\d+)?m?$/)))
      return (parseFloat(m[1]) * 60 + (m[2] ? +m[2] : 0)) * 60000;
    if ((m = s.match(/^(\d+(?:\.\d+)?)m?$/))) return parseFloat(m[1]) * 60000;
    return null;
  }

  function boot() {
    var track = document.querySelector("[data-track]");
    if (!track) return;

    var tasks = Array.prototype.slice.call(document.querySelectorAll(".task[data-id]"));
    if (!tasks.length) return;

    var key = "time:" + track.dataset.track;
    var db = {};
    try { db = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { db = {}; }

    function save() {
      try { localStorage.setItem(key, JSON.stringify(db)); } catch (e) { /* ignore */ }
    }

    function rec(id) {
      if (!db[id]) db[id] = { elapsed: 0, since: null, first: null, end: null };
      return db[id];
    }

    /* total ms including the span currently in flight */
    function live(r) {
      return r.elapsed + (r.since ? Date.now() - r.since : 0);
    }

    function running(r) { return !!r.since; }

    function stop(r) {
      if (r.since) {
        r.elapsed += Date.now() - r.since;
        r.since = null;
      }
    }

    function start(r) {
      if (r.since) return;
      r.since = Date.now();
      if (!r.first) r.first = r.since;
      r.end = null;
    }

    function anyRunning() {
      return tasks.some(function (t) { return running(rec(t.dataset.id)); });
    }

    /* ---- build the UI bits ---- */

    var totalEl = document.createElement("div");
    totalEl.className = "track-time";
    track.appendChild(totalEl);

    tasks.forEach(function (t) {
      var body = t.querySelector(".t-body") || t;

      var line = document.createElement("span");
      line.className = "t-time";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "t-timer";

      /* The task row is a <label>, so a plain click here would also toggle
         the checkbox. Kill both the default label activation and the bubble. */
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var r = rec(t.dataset.id);
        if (running(r)) stop(r); else start(r);
        save();
        paint();
      });

      line.appendChild(btn);

      /* Forgetting to press play is the normal case, not the exception, so
         entering the time afterwards has to be as easy as starting it. */
      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "t-timer edit";
      edit.textContent = "✎";
      edit.title = "ใส่เวลาย้อนหลัง";
      edit.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var r = rec(t.dataset.id);
        var current = live(r);
        var answer = window.prompt(
          "ทำขั้นนี้ไปกี่นาที? \n\nพิมพ์ได้หลายแบบ: 90 · 90m · 1.5h · 1h30 · 1:30\nใส่ 0 เพื่อล้างเวลาของขั้นนี้",
          current ? String(Math.round(current / 60000)) : ""
        );
        if (answer === null) return;
        var ms = parseDuration(answer);
        if (ms === null) {
          window.alert("อ่านไม่ออก — ลองแบบนี้: 90 หรือ 1.5h หรือ 1:30");
          return;
        }
        stop(r);
        if (ms === 0) {
          delete db[t.dataset.id];
        } else {
          r.elapsed = ms;
          /* Nothing was recorded live, so date the span backwards from now.
             The total is what matters; the clock time is a rough anchor. */
          if (!r.first) r.first = Date.now() - ms;
          if (t.querySelector("input").checked && !r.end) r.end = Date.now();
        }
        save();
        paint();
      });
      line.appendChild(edit);

      var text = document.createElement("span");
      text.className = "t-time-text";
      line.appendChild(text);
      body.appendChild(line);

      t._timeText = text;
      t._timeBtn = btn;

      t.querySelector("input").addEventListener("change", function (ev) {
        var r = rec(t.dataset.id);
        if (ev.target.checked) {
          stop(r);
          r.end = Date.now();
          /* Sequential workflow: roll straight into the next open step,
             but never steal the clock from something already running. */
          if (!anyRunning()) {
            for (var i = tasks.indexOf(t) + 1; i < tasks.length; i++) {
              if (!tasks[i].querySelector("input").checked) {
                start(rec(tasks[i].dataset.id));
                break;
              }
            }
          }
        } else {
          r.end = null;
        }
        save();
        paint();
      });
    });

    /* ---- render ---- */

    function paint() {
      var total = 0;
      var tracked = 0;

      tasks.forEach(function (t) {
        var r = db[t.dataset.id];
        var text = t._timeText;
        var btn = t._timeBtn;

        t.classList.toggle("running", !!(r && r.since));

        if (!r || (!r.first && !r.end)) {
          btn.textContent = "▶ จับเวลา";
          btn.className = "t-timer";
          text.textContent = "";
          return;
        }

        var ms = live(r);
        total += ms;
        if (ms > 0) tracked++;

        if (r.since) {
          btn.textContent = "⏸ พัก";
          btn.className = "t-timer on";
          text.textContent = "กำลังจับเวลา · " + dur(ms) + " · เริ่ม " + hm(r.first);
        } else if (r.end) {
          btn.textContent = "▶ ต่อ";
          btn.className = "t-timer";
          text.textContent = r.first
            ? hm(r.first) + " → " + hm(r.end) + " · รวม " + dur(ms)
            : "เสร็จ " + hm(r.end);
        } else {
          btn.textContent = "▶ ต่อ";
          btn.className = "t-timer";
          text.textContent = "พักอยู่ · " + dur(ms) + " · เริ่ม " + hm(r.first);
        }
      });

      totalEl.textContent = tracked
        ? "เวลาที่จับได้ " + dur(total) + " · " + tracked + " ขั้น"
        : "ยังไม่ได้จับเวลาขั้นไหน — กด ▶ ที่ขั้นที่กำลังทำ";
    }

    /* ---- export: a markdown table to paste into LEARNING-LOG.md ---- */

    var exportBtn = document.querySelector("[data-track-export]");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var rows = ["| ขั้น | เริ่ม | จบ | ใช้เวลา |", "| --- | --- | --- | --- |"];
        var total = 0;
        tasks.forEach(function (t) {
          var r = db[t.dataset.id];
          if (!r || !r.first) return;
          var ms = live(r);
          total += ms;
          var title = (t.querySelector(".t-title") || t).textContent.trim();
          rows.push("| " + title + " | " + ymd(r.first) + " " + hm(r.first) + " | " +
            (r.end ? hm(r.end) : "—") + " | " + dur(ms) + " |");
        });
        rows.push("", "รวม " + dur(total));
        var out = rows.join("\n");
        if (navigator.clipboard) {
          navigator.clipboard.writeText(out).then(function () {
            exportBtn.textContent = "คัดลอกแล้ว ✓";
            setTimeout(function () { exportBtn.textContent = "คัดลอกสรุปเวลา"; }, 2000);
          });
        } else {
          window.prompt("คัดลอกข้อความนี้", out);
        }
      });
    }

    var resetBtn = document.querySelector("[data-time-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!window.confirm("ล้างเวลาที่จับไว้ทั้งหมด?")) return;
        db = {};
        save();
        paint();
      });
    }

    paint();
    setInterval(paint, TICK_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
