/* Site navigation, injected on every page so there is exactly one copy to edit.

   Depth is derived from the page's own URL: every content page lives either at
   learning/ or exactly one level down in a known subdirectory. Deriving it from
   the path (rather than from a content attribute like data-glossary-href) keeps
   the nav correct no matter how a page writes its own glossary link.

   The current section is highlighted by matching the URL path. */

(function () {
  "use strict";

  /* subdirectories of learning/ that hold pages loading this nav */
  var SUBDIRS = /\/(lessons|reference|retrieval)\/$/;

  var LINKS = [
    { href: "index.html",                    label: "หน้าแรก",   match: /\/index\.html$|\/learning\/?$/ },
    { href: "index.html#lessons",            label: "บทเรียน",   match: /\/lessons\// },
    { href: "reference/glossary.html",       label: "Glossary",  match: /glossary\.html$/ },
    { href: "reference/roadmap.html",        label: "Roadmap",   match: /roadmap\.html$/ },
    { href: "reference/why-deliverables.html", label: "ทำไปทำไม", match: /why-deliverables\.html$/ },
    { href: "reference/data-structures.html", label: "Data structures", match: /data-structures\.html$/ },
    { href: "reference/python-scope.html",   label: "Python scope", match: /python-scope\.html$/ },
    { href: "index.html#retrieval",          label: "Retrieval", match: /\/retrieval\// }
  ];

  function build() {
    var path = location.pathname;
    var dir = path.replace(/[^/]*$/, "");
    var base = SUBDIRS.test(dir) ? "../" : "";

    var nav = document.createElement("nav");
    nav.className = "sitenav";

    var inner = document.createElement("div");
    inner.className = "sitenav-in";

    var brand = document.createElement("a");
    brand.className = "brand";
    brand.href = base + "index.html";
    brand.innerHTML = 'micrograd <span>· learning</span>';
    inner.appendChild(brand);

    LINKS.forEach(function (l) {
      var a = document.createElement("a");
      a.className = "nl";
      a.href = base + l.href;
      a.textContent = l.label;
      if (l.match.test(path)) a.classList.add("here");
      inner.appendChild(a);
    });

    nav.appendChild(inner);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
