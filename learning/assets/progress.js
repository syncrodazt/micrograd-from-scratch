/* Reusable persistent checklist + progress bar.

   Markup:
     <div class="track" data-track="micrograd-m1">
       <div class="track-bar"><span></span></div>
       <div class="track-count"></div>
     </div>
     ...
     <label class="task" data-id="grad-1"><input type="checkbox"><span>...</span></label>

   State is stored in localStorage under `track:<data-track>` so ticking a box
   survives a reload. Nothing is sent anywhere - the page is a local file. */

(function () {
  "use strict";

  function boot() {
    var track = document.querySelector("[data-track]");
    if (!track) return;

    var key = "track:" + track.dataset.track;
    var tasks = Array.prototype.slice.call(document.querySelectorAll(".task[data-id]"));
    if (!tasks.length) return;

    /* First visit: no stored state, so honour the `checked` attributes in the
       HTML (which mark work already finished) and persist them. */
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e) { raw = null; }
    var firstVisit = raw === null;

    var saved = {};
    if (!firstVisit) {
      try { saved = JSON.parse(raw) || {}; } catch (e) { saved = {}; }
    } else {
      tasks.forEach(function (t) {
        if (t.querySelector("input").defaultChecked) saved[t.dataset.id] = 1;
      });
    }

    var bar = track.querySelector(".track-bar span");
    var count = track.querySelector(".track-count");

    function paint() {
      var done = tasks.filter(function (t) { return t.querySelector("input").checked; }).length;
      var pct = Math.round((done / tasks.length) * 100);
      if (bar) bar.style.width = pct + "%";
      if (count) count.textContent = done + " / " + tasks.length + " ขั้น  ·  " + pct + "%";

      /* per-phase counters */
      document.querySelectorAll("[data-phase-count]").forEach(function (el) {
        var scope = el.closest(".phase");
        if (!scope) return;
        var ts = scope.querySelectorAll(".task[data-id] input");
        var d = 0;
        ts.forEach(function (i) { if (i.checked) d++; });
        el.textContent = d + "/" + ts.length;
        scope.classList.toggle("phase-done", ts.length > 0 && d === ts.length);
      });
    }

    function save() {
      var out = {};
      tasks.forEach(function (t) {
        if (t.querySelector("input").checked) out[t.dataset.id] = 1;
      });
      try { localStorage.setItem(key, JSON.stringify(out)); } catch (e) { /* ignore */ }
    }

    tasks.forEach(function (t) {
      var box = t.querySelector("input");
      box.checked = !!saved[t.dataset.id];
      t.classList.toggle("done", box.checked);
      box.addEventListener("change", function () {
        t.classList.toggle("done", box.checked);
        save();
        paint();
      });
    });

    var reset = document.querySelector("[data-track-reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        tasks.forEach(function (t) {
          t.querySelector("input").checked = false;
          t.classList.remove("done");
        });
        save();
        paint();
      });
    }

    if (firstVisit) save();
    paint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
