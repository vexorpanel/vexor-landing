/* VEXOR · home: entrada suave al hacer scroll y cifras que cuentan hasta su valor (el valor final es el del HTML). */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rv = document.querySelectorAll(".rv");
  if (reduce || !("IntersectionObserver" in window)) {
    for (var i = 0; i < rv.length; i++) { rv[i].classList.add("in"); }
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  for (var j = 0; j < rv.length; j++) { io.observe(rv[j]); }

  function fmt(v, tipo, lang) {
    if (tipo === "eur") { var n = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : "."); return lang === "en" ? "€" + n : n + " €"; }
    if (tipo === "pct") { return (lang === "en" ? v.toFixed(1) : v.toFixed(1).replace(".", ",")) + (lang === "en" ? "%" : " %"); }
    return String(Math.round(v));
  }
  var lang = document.documentElement.lang || "es";
  var cifras = document.querySelectorAll("[data-cuenta]");
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      cio.unobserve(e.target);
      var el = e.target, fin = parseFloat(el.getAttribute("data-cuenta")), tipo = el.getAttribute("data-fmt"), final = el.textContent, t0 = null;
      function paso(t) {
        if (!t0) { t0 = t; }
        var k = Math.min(1, (t - t0) / 1600), ease = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? fmt(fin * ease, tipo, lang) : final;
        if (k < 1) { requestAnimationFrame(paso); }
      }
      requestAnimationFrame(paso);
    });
  }, { threshold: 0.6 });
  for (var c = 0; c < cifras.length; c++) { cio.observe(cifras[c]); }
})();

/* adaptativo-17nov · menú en móvil: abre y cierra con el botón, con Escape, al tocar fuera y al elegir una sección */
(function () {
  "use strict";
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("menu-secciones");
  if (!btn || !nav) { return; }
  var cab = btn.closest("header");
  function pon(abierto, foco) {
    cab.classList.toggle("menu-abierto", abierto);
    btn.setAttribute("aria-expanded", abierto ? "true" : "false");
    btn.setAttribute("aria-label", btn.getAttribute(abierto ? "data-cerrar" : "data-abrir"));
    if (abierto) { var a = nav.querySelector("a"); if (a) { a.focus(); } } else if (foco) { btn.focus(); }
  }
  btn.addEventListener("click", function () { pon(btn.getAttribute("aria-expanded") !== "true", false); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { pon(false, false); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && cab.classList.contains("menu-abierto")) { pon(false, true); } });
  document.addEventListener("click", function (e) { if (cab.classList.contains("menu-abierto") && !cab.contains(e.target)) { pon(false, false); } });
  var mq = window.matchMedia("(min-width:900px)");
  var al = function () { if (mq.matches) { pon(false, false); } };
  if (mq.addEventListener) { mq.addEventListener("change", al); } else if (mq.addListener) { mq.addListener(al); }
})();
