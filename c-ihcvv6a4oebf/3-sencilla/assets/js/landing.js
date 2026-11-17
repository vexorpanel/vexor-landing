/* VEXOR · landing sencilla · sin librerías.
   ─────────────────────────────────────────────────────────────
   PARA PASAR A WHATSAPP: cambia SOLO la línea «whatsapp:» de abajo
   (número con prefijo y sin + ni espacios, por ejemplo "34XXXXXXXXX").
   Vacío = no aparece nada de WhatsApp y todos los botones abren el correo.
   ───────────────────────────────────────────────────────────── */
/* AVISO DE COOKIES AL ENTRAR: hoy la web no mide nada (no hay ninguna herramienta de medición conectada),
   así que no hay nada que preguntar y el aviso no salta solo. Sigue en el pie («Gestionar cookies»).
   El día que se conecte una herramienta de medición, cambia esta línea a true. */
var PREGUNTAR_COOKIES_AL_ENTRAR = false;

var CONTACTO = {
  whatsapp: "",
  email: "gerard@vexorconsulting.com",
  asunto: "Consulta desde la web de VEXOR Consulting",
  cuerpo: "Hola, tengo una tienda online y me gustaría saber cómo trabajáis el email marketing."
};

(function () {
  "use strict";
  var d = document;
  var q = encodeURIComponent;
  var enlace = CONTACTO.whatsapp
    ? "https://wa.me/" + CONTACTO.whatsapp + "?text=" + q(CONTACTO.cuerpo)
    : "mailto:" + CONTACTO.email + "?subject=" + q(CONTACTO.asunto) + "&body=" + q(CONTACTO.cuerpo);

  /* todos los botones de contacto */
  [].forEach.call(d.querySelectorAll("[data-contacto]"), function (a) {
    a.setAttribute("href", enlace);
    if (CONTACTO.whatsapp) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
  });
  [].forEach.call(d.querySelectorAll("[data-correo]"), function (el) { el.textContent = CONTACTO.email; });
  [].forEach.call(d.querySelectorAll("[data-correo-enlace]"), function (a) { a.setAttribute("href", "mailto:" + CONTACTO.email); });

  /* aviso de cookies: se pinta al entrar solo si PREGUNTAR_COOKIES_AL_ENTRAR; desde el pie, siempre */
  var aviso = d.getElementById("cookie");
  if (aviso) {
    if (PREGUNTAR_COOKIES_AL_ENTRAR) aviso.classList.add("abierto");
    else aviso.hidden = true;
    [].forEach.call(d.querySelectorAll("[data-cookie-open]"), function (b) {
      b.addEventListener("click", function () { aviso.classList.add("abierto"); aviso.hidden = false; });
    });
  }

  /* botón Copiar (para quien no tenga programa de correo) */
  var cop = d.getElementById("copiar"), est = d.getElementById("copiado");
  function dilo(t) { if (est) { est.textContent = t; clearTimeout(est._x); est._x = setTimeout(function () { est.textContent = ""; }, 4000); } }
  function respaldo() {
    var t = d.createElement("textarea"); t.value = CONTACTO.email; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    d.body.appendChild(t); t.select(); var ok = false; try { ok = d.execCommand("copy"); } catch (e) {} d.body.removeChild(t); return ok;
  }
  if (cop) cop.addEventListener("click", function () {
    var fin = function (ok) { dilo(ok ? "Dirección copiada: " + CONTACTO.email : "No se pudo copiar. Selecciónala y cópiala a mano: " + CONTACTO.email); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(CONTACTO.email).then(function () { fin(true); }, function () { fin(respaldo()); });
    else fin(respaldo());
  });

  /* movimiento con medida */
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(v, n, suf) { var dec = String(n).indexOf(".") > -1 ? 1 : 0; return v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; }
  function contar(el) {
    if (el._hecho) return; el._hecho = 1;
    var n = parseFloat(el.getAttribute("data-n")), suf = el.getAttribute("data-suf") || "", t0 = performance.now();
    if (reduce) { el.textContent = fmt(n, n, suf); return; }
    (function f(t) { var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(n * e, n, suf); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  var top = d.getElementById("top");
  addEventListener("scroll", function () { top.classList.toggle("sombra", scrollY > 8); }, { passive: true });
  var items = d.querySelectorAll(".sube");
  if (!reduce && "IntersectionObserver" in window) {
    d.documentElement.classList.add("mov");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        [].forEach.call(e.target.querySelectorAll("[data-n]"), contar);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    [].forEach.call(items, function (el) { io.observe(el); });
  } else {
    [].forEach.call(d.querySelectorAll("[data-n]"), function (el) { el.textContent = fmt(parseFloat(el.getAttribute("data-n")), el.getAttribute("data-n"), el.getAttribute("data-suf") || ""); });
  }
})();
