/* VEXOR Consulting · landing · ~90 líneas, sin dependencias.
   1) Banner de cookies (rechazar = aceptar de fácil). 2) Eventos de analítica, SOLO si se aceptó.
   3) Botón flotante de WhatsApp en móvil, que se esconde cuando ya hay otro botón a la vista. */
(function () {
  "use strict";
  var KEY = "vexor_consent"; // "granted" | "denied"
  var doc = document;
  doc.documentElement.classList.add("js");

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento: se pregunta cada vez */ } }

  /* ── Analítica ──
     Los eventos se empujan a window.dataLayer (formato GTM/GA4) y solo si hay consentimiento.
     No se carga ninguna herramienta de terceros: la herramienta elegida se conecta aquí o en un gestor de etiquetas. */
  var lang = doc.documentElement.lang || "es";
  function track(name, params) {
    if (read() !== "granted") { return; }
    var data = { event: name, lang: lang };
    for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) { data[k] = params[k]; } }
    (window.dataLayer = window.dataLayer || []).push(data);
  }
  window.vexorTrack = track;

  doc.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a") : null;
    if (!a) { return; }
    if (a.hasAttribute("data-wa")) { track("whatsapp_click", { location: a.getAttribute("data-wa") }); }
    if (a.hasAttribute("data-lang-switch")) { track("language_change", { from: lang, to: a.getAttribute("hreflang") }); }
  });

  var results = doc.getElementById("resultados");
  if (results && "IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { track("scroll_resultados", {}); seen.disconnect(); }
    }, { threshold: 0.25 });
    seen.observe(results);
  }

  /* ── Banner de cookies ── */
  var banner = doc.getElementById("cookie");
  function show() { if (banner) { banner.hidden = false; } }
  function hide() { if (banner) { banner.hidden = true; } }
  function choose(v) { write(v); hide(); }
  if (banner) {
    doc.getElementById("cookie-yes").addEventListener("click", function () { choose("granted"); });
    doc.getElementById("cookie-no").addEventListener("click", function () { choose("denied"); });
    if (!read()) { show(); }
  }
  var reopen = doc.querySelectorAll("[data-cookie-open]");
  for (var i = 0; i < reopen.length; i++) { reopen[i].addEventListener("click", show); }

  /* ── Botón flotante (móvil): visible salvo si el botón de la cabecera o el bloque de contacto están en pantalla ── */
  var float = doc.getElementById("float");
  var hero = doc.querySelector("#cabecera .cta");
  var contact = doc.getElementById("contacto");
  if (float && hero && contact && "IntersectionObserver" in window) {
    var inView = { hero: true, contact: false };
    var update = function () { float.classList.toggle("on", !inView.hero && !inView.contact); };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { inView[e.target === hero ? "hero" : "contact"] = e.isIntersecting; });
      update();
    });
    io.observe(hero); io.observe(contact);
    update();
  }
})();
