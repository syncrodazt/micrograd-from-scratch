/* Site navigation, injected on every page so there is exactly one copy to edit.

   Depth is derived from the page's data-glossary-href:
     "reference/glossary.html"     -> page sits at learning/      -> base "./"
     "../reference/glossary.html"  -> page sits one level down    -> base "../"
   Pages therefore need no extra attribute.

   The current section is highlighted by matching the URL path. */

(function () {
  "use strict";

  var LINKS = [
    { href: "index.html",                    label: "หน้าแรก",   match: /\/index\.html$|\/learning\/?$/ },
    { href: "index.html#lessons",            label: "บทเรียน",   match: /\/lessons\// },
    { href: "reference/glossary.html",       label: "Glossary",  match: /glossary\.html$/ },
    { href: "reference/python-scope.html",   label: "Python scope", match: /python-scope\.html$/ },
    { href: "index.html#retrieval",          label: "Retrieval", match: /\/retrieval\// }
  ];

  function build() {
    var gh = document.body.dataset.glossaryHref || "../reference/glossary.html";
    var base = gh.indexOf("../") === 0 ? "../" : "";

    var path = location.pathname;

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
