/* Shared lesson runtime:
   1. glossary popups for <span class="g" data-t="key">
   2. auto-built right-hand table of contents from h2/h3
   3. scrollspy highlighting for the TOC

   Every lesson page loads glossary-data.js then this file. */

(function () {
  "use strict";

  /* ============================================================
     1. GLOSSARY POPUPS
     ============================================================ */

  function initGlossary() {
    var terms = document.querySelectorAll(".g[data-t]");
    if (!terms.length || !window.GLOSSARY) return;

    var base = document.body.dataset.glossaryHref || "../reference/glossary.html";

    var pop = document.createElement("div");
    pop.id = "gpop";
    pop.setAttribute("role", "tooltip");
    document.body.appendChild(pop);

    var hideTimer = null;
    var current = null;

    function fill(key) {
      var e = window.GLOSSARY[key];
      if (!e) return false;
      pop.innerHTML =
        '<div class="gp-term"></div>' +
        '<div class="gp-en"></div>' +
        '<div class="gp-def"></div>' +
        '<a class="gp-more" href="' + base + "#" + key + '">อ่านเต็มใน glossary →</a>';
      pop.querySelector(".gp-term").textContent = e.term;
      pop.querySelector(".gp-en").textContent = e.en;
      pop.querySelector(".gp-def").innerHTML = e.def;
      return true;
    }

    function place(el) {
      var r = el.getBoundingClientRect();
      pop.style.visibility = "hidden";
      pop.classList.add("on");
      var pw = pop.offsetWidth;
      var ph = pop.offsetHeight;

      var left = window.scrollX + r.left;
      var maxLeft = window.scrollX + document.documentElement.clientWidth - pw - 12;
      if (left > maxLeft) left = maxLeft;
      if (left < window.scrollX + 12) left = window.scrollX + 12;

      // prefer below; flip above when it would run off the bottom
      var top = window.scrollY + r.bottom + 8;
      if (r.bottom + ph + 16 > window.innerHeight && r.top - ph - 8 > 0) {
        top = window.scrollY + r.top - ph - 8;
      }

      pop.style.left = left + "px";
      pop.style.top = top + "px";
      pop.style.visibility = "";
    }

    function show(el) {
      clearTimeout(hideTimer);
      var key = el.dataset.t;
      if (!fill(key)) return;
      current = el;
      place(el);
    }

    function hide() {
      pop.classList.remove("on");
      current = null;
    }

    function scheduleHide() {
      hideTimer = setTimeout(hide, 180);
    }

    terms.forEach(function (el) {
      if (!window.GLOSSARY[el.dataset.t]) {
        console.warn("glossary key not found:", el.dataset.t);
        return;
      }
      el.setAttribute("tabindex", "0");
      el.addEventListener("mouseenter", function () { show(el); });
      el.addEventListener("mouseleave", scheduleHide);
      el.addEventListener("focus", function () { show(el); });
      el.addEventListener("blur", scheduleHide);
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        if (current === el) { hide(); } else { show(el); }
      });
    });

    pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    pop.addEventListener("mouseleave", scheduleHide);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") hide();
    });
    window.addEventListener("scroll", function () {
      if (current) place(current);
    }, { passive: true });
    window.addEventListener("resize", hide);
  }

  /* ============================================================
     2. TABLE OF CONTENTS + 3. SCROLLSPY
     ============================================================ */

  function slug(text, i) {
    var s = text
      .toLowerCase()
      .replace(/[^\wก-๙\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return s || "s" + i;
  }

  function initToc() {
    var nav = document.querySelector(".toc");
    var main = document.querySelector("main");
    if (!nav || !main) return;

    var heads = main.querySelectorAll("h2, h3");
    if (!heads.length) { nav.style.display = "none"; return; }

    var list = document.createElement("div");
    var links = [];

    heads.forEach(function (h, i) {
      if (!h.id) h.id = slug(h.textContent, i);
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      if (h.tagName === "H3") a.className = "lvl3";
      list.appendChild(a);
      links.push({ a: a, h: h });
    });

    var title = document.createElement("div");
    title.className = "toc-title";
    title.textContent = "ในหน้านี้";
    nav.appendChild(title);
    nav.appendChild(list);

    /* scrollspy: highlight the last heading whose top has passed the marker */
    function spy() {
      var marker = 90;
      var active = links[0];
      for (var i = 0; i < links.length; i++) {
        if (links[i].h.getBoundingClientRect().top <= marker) active = links[i];
      }
      links.forEach(function (l) { l.a.classList.toggle("active", l === active); });
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { spy(); ticking = false; });
    }, { passive: true });

    spy();
  }

  function boot() {
    initGlossary();
    initToc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
