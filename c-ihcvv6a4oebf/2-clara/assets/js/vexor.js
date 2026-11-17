/* VEXOR · pegamento con la página. Sin librerías, sin recursos de terceros.
   1) Cabecera con sombra al bajar (IntersectionObserver, nada de listeners de scroll).
   2) Botón «Copiar» del correo.  3) Aviso de cookies (no salta solo; se abre desde el pie).
   4) Medición de clics de contacto SOLO si se aceptó; hoy no hay ninguna herramienta conectada: no sale nada.
   5) Botón que acompaña en el móvil. */
(function () {
  "use strict";
  var N = window.VexorNucleo, d = document, KEY = "vexor_consent";
  d.documentElement.classList.add("js");

  function leer() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento: se pregunta cada vez */ } }

  function evento(nombre, params) {
    var ev = N.construirEvento(leer(), nombre, params, d.documentElement.lang);
    if (ev) { (window.dataLayer = window.dataLayer || []).push(ev); }
  }
  d.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-lugar]") : null;
    if (a) { evento("contacto_click", { location: a.getAttribute("data-lugar") }); }
  });

  /* cabecera */
  var top = d.getElementById("top"), cen = d.getElementById("top-sentinel");
  if (top && cen && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { top.classList.toggle("sombra", !es[0].isIntersecting); }).observe(cen);
  }

  /* cookies */
  var aviso = d.getElementById("cookie");
  if (aviso) {
    var mostrar = function () { aviso.hidden = false; };
    var elegir = function (v) { guardar(v); aviso.hidden = true; };
    d.getElementById("cookie-yes").addEventListener("click", function () { elegir("granted"); });
    d.getElementById("cookie-no").addEventListener("click", function () { elegir("denied"); });
    [].forEach.call(d.querySelectorAll("[data-cookie-open]"), function (b) { b.addEventListener("click", mostrar); });
    if (N.debePreguntarCookies(aviso.getAttribute("data-preguntar") === "1", leer())) { mostrar(); }
  }

  /* copiar el correo */
  var cop = d.getElementById("copiar"), est = d.getElementById("copiado");
  if (cop) {
    var email = cop.getAttribute("data-email"), tx = { ok: cop.getAttribute("data-ok"), mal: cop.getAttribute("data-mal") };
    var decir = function (t) { if (est) { est.textContent = t; clearTimeout(est._x); est._x = setTimeout(function () { est.textContent = ""; }, 4000); } };
    var respaldo = function () {
      var t = d.createElement("textarea"); t.value = email; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
      d.body.appendChild(t); t.select(); var ok = false; try { ok = d.execCommand("copy"); } catch (e) { /* nada */ } d.body.removeChild(t); return ok;
    };
    cop.addEventListener("click", function () {
      var fin = function (ok) { decir(N.mensajeCopia(ok, email, tx)); };
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(email).then(function () { fin(true); }, function () { fin(respaldo()); }); }
      else { fin(respaldo()); }
    });
  }

  /* botón que acompaña en el móvil */
  var flota = d.getElementById("float"), hero = d.querySelector("#cabecera .btn"), con = d.getElementById("contacto");
  if (flota && hero && con && "IntersectionObserver" in window) {
    var vista = { hero: true, contacto: false };
    /* además del bloque de contacto, el panel del diagnóstico y el medidor llevan su propio botón: ahí tampoco se enseña el flotante */
    var zonas = [con].concat([].slice.call(d.querySelectorAll(".diag__panel, #medidor"))), dentro = zonas.map(function () { return false; });
    var poner = function () { var on = N.debeMostrarFlota(vista); flota.classList.toggle("on", on); if (top) { top.classList.toggle("sin-boton", on); } };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === hero) { vista.hero = e.isIntersecting; } else { dentro[zonas.indexOf(e.target)] = e.isIntersecting; }
      });
      vista.contacto = dentro.some(function (x) { return x; });
      poner();
    });
    io.observe(hero); zonas.forEach(function (z) { io.observe(z); }); poner();
  }

  /* luz que sigue al cursor en las tarjetas de cifras (solo con ratón) */
  [].forEach.call(d.querySelectorAll(".cifras .bz"), function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ruta de «Cómo trabajamos»: trazo que se dibuja, sobre que lo recorre y pasos que se encienden.
     Con «reducir movimiento» (o sin IntersectionObserver) todo queda dibujado y encendido, sin movimiento. */
  var ruta = d.getElementById("ruta");
  if (ruta) {
    var svg = ruta.querySelector(".hilo"), base = svg.querySelector(".hilo__base"), draw = svg.querySelector(".hilo__draw"), sobre = svg.querySelector(".hilo__sobre");
    var pasos = [].slice.call(ruta.querySelectorAll(".paso")), L = 0, nodos = [], activo = false, pendiente = false;
    var quieto = (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || !("IntersectionObserver" in window);
    var pintar = function () {
      pendiente = false;
      var p = quieto ? 1 : N.progresoRuta(ruta.getBoundingClientRect().top, ruta.offsetHeight, window.innerHeight), len = L * p;
      draw.style.strokeDashoffset = L - len;
      var q = draw.getPointAtLength(len);
      sobre.setAttribute("transform", "translate(" + q.x + "," + q.y + ")");
      sobre.style.opacity = (!quieto && p > 0.005 && p < 0.985) ? 1 : 0;
      N.nodosEncendidos(nodos, len, p).forEach(function (on, i) { pasos[i].classList.toggle("on", on); });
    };
    var armar = function () {
      var r = ruta.getBoundingClientRect(), vertical = window.innerWidth < 900;
      svg.setAttribute("viewBox", "0 0 " + r.width + " " + r.height);
      var pts = pasos.map(function (p) { var n = p.querySelector(".paso__n").getBoundingClientRect(); return { x: n.left - r.left + n.width / 2, y: n.top - r.top + n.height / 2 }; });
      var dd = N.trazo(pts, vertical); base.setAttribute("d", dd); draw.setAttribute("d", dd);
      L = draw.getTotalLength(); draw.style.strokeDasharray = L;
      nodos = pts.map(function (pt) {
        var mejor = 0, md = 1e12;
        for (var k = 0; k <= 240; k++) { var q = draw.getPointAtLength(L * k / 240), dx = q.x - pt.x, dy = q.y - pt.y, dd2 = dx * dx + dy * dy; if (dd2 < md) { md = dd2; mejor = L * k / 240; } }
        return mejor;
      });
      pintar();
    };
    var pedir = function () { if (activo && !pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    armar();
    if (!quieto) {
      new IntersectionObserver(function (es) { activo = es[0].isIntersecting; pedir(); }, { rootMargin: "60% 0px 60% 0px" }).observe(ruta);
      window.addEventListener("scroll", pedir, { passive: true });
    }
    var t0; window.addEventListener("resize", function () { clearTimeout(t0); t0 = setTimeout(armar, 150); });
    if (d.fonts && d.fonts.ready) { d.fonts.ready.then(armar); }
    window.addEventListener("load", armar);
  }
})();

/* 6) Diagnóstico y medidor (14-nov). Todo se calcula en el navegador: no se envía ni se guarda nada. */
(function () {
  var d = document, N = window.VexorNucleo;
  if (!N) { return; }
  var diag = d.querySelector("[data-diag]");
  if (diag) {
    var niveles = [].map.call(diag.querySelectorAll(".diag__niveles li"), function (li) { return [parseInt(li.getAttribute("data-desde"), 10), li.getAttribute("data-nombre"), li.textContent]; });
    var botones = [].slice.call(diag.querySelectorAll(".pieza"));
    var todas = botones.map(function (b) { return b.getAttribute("data-nombre"); });
    var nEl = diag.querySelector("[data-diag-n]"), barra = diag.querySelector("[data-diag-barra]"), pb = diag.querySelector("[role=progressbar]");
    var nivEl = diag.querySelector("[data-diag-nivel]"), txtEl = diag.querySelector("[data-diag-txt]");
    var faltaBox = diag.querySelector("[data-diag-faltan]"), lista = diag.querySelector("[data-diag-lista]"), cta = diag.querySelector("[data-diag-cta]");
    var t = { asunto: diag.getAttribute("data-asunto"), asuntoOk: diag.getAttribute("data-asunto-ok"), cuerpo: diag.getAttribute("data-cuerpo"), cuerpoOk: diag.getAttribute("data-cuerpo-ok") };
    var tocado = false, nivelAntes = "";
    var pintar = function () {
      var marcadas = botones.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.getAttribute("data-nombre"); });
      var n = marcadas.length, faltan = N.piezasQueFaltan(todas, marcadas), nv = N.nivelDiagnostico(n, niveles);
      nEl.textContent = n;
      barra.style.transform = "scaleX(" + (n / todas.length) + ")";
      var n2 = diag.querySelector("[data-diag-n2]"), b2 = diag.querySelector("[data-diag-barra2]");
      if (n2) { n2.textContent = n; b2.style.transform = "scaleX(" + (n / todas.length) + ")"; }
      var nv2 = diag.querySelector("[data-diag-nivel2]");
      if (nv2 && tocado) { nv2.textContent = nv.nombre; }
      if (tocado && nv.nombre !== nivelAntes && nivelAntes !== "") {
        [nivEl, nv2].forEach(function (el) { if (el) { el.classList.remove("sube"); void el.offsetWidth; el.classList.add("sube"); } });
      }
      if (tocado) { nivelAntes = nv.nombre; }
      pb.setAttribute("aria-valuenow", n);
      diag.classList.toggle("completo", n === todas.length);
      if (!tocado) { return; }
      nivEl.textContent = nv.nombre; txtEl.textContent = nv.texto;
      lista.innerHTML = "";
      faltan.forEach(function (f) { var li = d.createElement("li"); li.textContent = f; lista.appendChild(li); });
      faltaBox.hidden = faltan.length === 0;
      cta.href = N.correoDiagnostico(diag.getAttribute("data-email"), faltan, t);
      cta.textContent = faltan.length === 0 ? cta.getAttribute("data-t-ok") : cta.getAttribute("data-t");
    };
    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        tocado = true;
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
        pintar();
      });
    });
    pintar();
  }
  var med = d.querySelector("[data-med]");
  if (med) {
    var tot = med.querySelector("[data-med-total]"), em = med.querySelector("[data-med-email]");
    var caja = med.closest(".med__g");
    var res = caja.querySelector("[data-med-res]"), lec = caja.querySelector("[data-med-lectura]"), mb = caja.querySelector("[data-med-barra]");
    var inicio = res.textContent;
    var calc = function () {
      var r = N.medirEmail(tot.value, em.value);
      caja.classList.remove("bajo", "medio", "alto", "error");
      if (r.estado === "vacio") { res.textContent = inicio; lec.textContent = ""; mb.style.transform = "scaleX(0)"; return; }
      if (r.estado === "error") { caja.classList.add("error"); res.textContent = med.getAttribute("data-error"); lec.textContent = ""; mb.style.transform = "scaleX(0)"; return; }
      caja.classList.add(r.tramo);
      res.textContent = med.getAttribute("data-res").replace("{p}", String(r.p).replace(".", ","));
      lec.textContent = med.getAttribute("data-" + r.tramo);
      mb.style.transform = "scaleX(" + Math.min(r.p, 100) / 100 + ")";
    };
    tot.addEventListener("input", calc); em.addEventListener("input", calc);
  }
})();

/* 7) Bandeja de resultados (14-nov): cada cifra es un email cerrado; al abrirlo, la cifra cuenta hasta su valor. */
(function () {
  var d = document, N = window.VexorNucleo, ban = d.querySelector("[data-bandeja]");
  if (!N || !ban) { return; }
  var quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var asuntos = {};
  [].forEach.call(ban.querySelectorAll(".bandeja__asuntos li"), function (li) { asuntos[li.getAttribute("data-id")] = li.textContent; });
  var tarjetas = [].slice.call(d.querySelectorAll(".cifras > li"));
  var nEl = ban.querySelector("[data-bandeja-n]"), txt = ban.querySelector("[data-bandeja-txt]"), todos = ban.querySelector("[data-bandeja-todos]");
  var abiertos = 0;
  var contar = function (el) {
    var final = el.getAttribute("data-final");
    if (quieto) { el.textContent = final; return; }
    var t0 = null, dur = 1100;
    var paso = function (ts) {
      if (t0 === null) { t0 = ts; }
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = N.contarCifra(final, e);
      if (k < 1) { requestAnimationFrame(paso); }
    };
    requestAnimationFrame(paso);
  };
  var abrir = function (li) {
    if (li.classList.contains("abierto")) { return; }
    li.classList.add("abierto");
    var sobre = li.querySelector(".sobre"), caja = li.querySelector(".bz");
    caja.removeAttribute("aria-hidden");
    if (sobre) { sobre.setAttribute("tabindex", "-1"); sobre.setAttribute("aria-hidden", "true"); }
    var v = li.querySelector(".cifra__v");
    if (v) { contar(v); }
    abiertos += 1;
    nEl.textContent = abiertos;
    if (abiertos === tarjetas.length) { ban.classList.add("al-dia"); txt.textContent = ban.getAttribute("data-fin"); nEl.hidden = true; todos.hidden = true; }
  };
  tarjetas.forEach(function (li) {
    var id = (li.className.match(/c-([a-z]+)/) || [])[1];
    if (!asuntos[id]) { return; }
    var v = li.querySelector(".cifra__v");
    if (v) { v.setAttribute("data-final", v.textContent); }
    var b = d.createElement("button");
    b.type = "button"; b.className = "sobre";
    b.setAttribute("aria-label", ban.getAttribute("data-abrir") + ": " + asuntos[id]);
    b.innerHTML = '<svg class="sobre__ico" viewBox="0 0 24 18" aria-hidden="true" focusable="false"><rect x="1" y="1" width="22" height="16" rx="3"/><path d="m2 3 10 7 10-7"/></svg><span class="sobre__de"><i aria-hidden="true"></i><b></b></span><span class="sobre__asunto"></span><span class="sobre__vista"></span><span class="sobre__btn"></span>';
    b.querySelector(".sobre__de b").textContent = ban.getAttribute("data-remitente");
    b.querySelector(".sobre__asunto").textContent = asuntos[id];
    b.querySelector(".sobre__vista").textContent = ban.getAttribute("data-vista");
    b.querySelector(".sobre__btn").textContent = ban.getAttribute("data-abrir");
    b.addEventListener("click", function () { abrir(li); });
    li.classList.add("cerrado");
    li.querySelector(".bz").setAttribute("aria-hidden", "true");
    li.appendChild(b);
  });
  todos.addEventListener("click", function () {
    tarjetas.forEach(function (li, i) { setTimeout(function () { abrir(li); }, quieto ? 0 : i * 140); });
  });
  ban.hidden = false;
})();

/* 8) Titulares que entran palabra a palabra (método de los vídeos, 15-nov). El texto no cambia: solo se envuelve
   cada palabra para animarla. Con «reducir movimiento» o sin IntersectionObserver no se toca nada. */
(function () {
  var d = document;
  if ((window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || !("IntersectionObserver" in window)) { return; }
  var titulos = [].slice.call(d.querySelectorAll(".h2"));
  titulos.forEach(function (h) {
    if (h.children.length) { return; }
    var palabras = h.textContent.split(/(\s+)/), k = 0;
    h.textContent = "";
    palabras.forEach(function (p) {
      if (/^\s+$/.test(p) || !p) { h.appendChild(d.createTextNode(p)); return; }
      var s = d.createElement("span"); s.className = "pal"; s.style.setProperty("--k", k++); s.textContent = p; h.appendChild(s);
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vista"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -10% 0px" });
  titulos.forEach(function (h) { io.observe(h); });
  var ruta = d.getElementById("ruta"); if (ruta) { ruta.classList.add("armada"); }
})();

/* 8b) Salvavidas de los titulares: al imprimir, o si se llega al final de la página, se ven todos. */
(function () {
  var todos = function () { [].forEach.call(document.querySelectorAll(".h2"), function (h) { h.classList.add("vista"); }); };
  window.addEventListener("beforeprint", todos);
  window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) { todos(); }
  }, { passive: true });
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
