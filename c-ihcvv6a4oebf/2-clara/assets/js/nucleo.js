/* VEXOR · núcleo: funciones puras (sin DOM) para poder probarlas con `node --test`.
   Se usa en la página (window.VexorNucleo) y en las pruebas (require). */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) { module.exports = fabrica(); }
  else { raiz.VexorNucleo = fabrica(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* El botón que acompaña en el móvil solo se ve si NO hay ya otro botón de contacto en pantalla. */
  function debeMostrarFlota(vista) { return !vista.hero && !vista.contacto; }

  /* Un evento de medición solo existe si el visitante lo permitió. */
  function construirEvento(consentimiento, nombre, params, idioma) {
    if (consentimiento !== "granted") { return null; }
    var d = { event: nombre, lang: idioma || "es" };
    for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) { d[k] = params[k]; } }
    return d;
  }

  /* El aviso de cookies solo salta solo si se pide Y no hay elección guardada. */
  function debePreguntarCookies(preguntarAlEntrar, eleccionGuardada) { return !!preguntarAlEntrar && !eleccionGuardada; }

  function mensajeCopia(ok, email, textos) { return (ok ? textos.ok : textos.mal) + email; }

  /* Ruta de «Cómo trabajamos»: cuánto del trazo está dibujado (0 a 1) según dónde está la sección en la pantalla. */
  function progresoRuta(arriba, alto, altoPantalla) {
    var p = (0.8 * altoPantalla - arriba) / (0.25 * altoPantalla + alto);
    return Math.max(0, Math.min(1, p));
  }

  /* Qué pasos están encendidos: el trazo ya llegó a su punto (y ya ha empezado a dibujarse). */
  function nodosEncendidos(largos, dibujado, p) {
    return largos.map(function (l) { return p > 0.003 && dibujado >= l - 1; });
  }

  /* Trazo SVG que pasa por los puntos, con una curva suave y alterna (un flujo, no una regla). */
  function trazo(puntos, vertical) {
    var r = function (n) { return Math.round(n * 10) / 10; };
    var d = "M" + r(puntos[0].x) + " " + r(puntos[0].y);
    for (var i = 1; i < puntos.length; i++) {
      var a = puntos[i - 1], b = puntos[i], s = (i % 2 ? -1 : 1) * 26;
      if (vertical) { var dy = b.y - a.y; d += "C" + r(a.x + s) + " " + r(a.y + dy / 2) + " " + r(b.x + s) + " " + r(b.y - dy / 2) + " " + r(b.x) + " " + r(b.y); }
      else { var dx = b.x - a.x; d += "C" + r(a.x + dx / 2) + " " + r(a.y + s) + " " + r(b.x - dx / 2) + " " + r(b.y + s) + " " + r(b.x) + " " + r(b.y); }
    }
    return d;
  }

  /* DIAGNÓSTICO · cuántas piezas tiene, en qué nivel cae y qué le falta. Los niveles vienen de la página:
     [[desde, nombre, texto], ...] ordenados de menos a más. */
  function nivelDiagnostico(n, niveles) {
    var elegido = niveles[0];
    for (var i = 0; i < niveles.length; i++) { if (n >= niveles[i][0]) { elegido = niveles[i]; } }
    return { nombre: elegido[1], texto: elegido[2] };
  }
  function piezasQueFaltan(piezas, marcadas) {
    return piezas.filter(function (p) { return marcadas.indexOf(p) === -1; });
  }
  /* El correo que se abre al pedir las piezas: asunto y cuerpo ya escritos, nada se envía solo. */
  function correoDiagnostico(email, faltan, t) {
    var completo = faltan.length === 0;
    var asunto = completo ? t.asuntoOk : t.asunto.replace("{n}", String(faltan.length));
    var cuerpo = completo ? t.cuerpoOk : t.cuerpo + "\n\n" + faltan.map(function (f) { return "- " + f; }).join("\n");
    return "mailto:" + email + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
  }

  /* MEDIDOR · lee una cifra escrita a la española o a la inglesa ("12.500,50", "12500.5", "12 500 €"). */
  function leerCifra(txt) {
    var s = String(txt == null ? "" : txt).replace(/[€\s]/g, "");
    if (!s) { return null; }
    if (s.indexOf(",") > -1 && s.indexOf(".") > -1) {
      s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
    } else if (s.indexOf(",") > -1) {
      s = /,\d{3}$/.test(s) && s.split(",").length > 1 && !/,\d{1,2}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
    } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, "");
    }
    if (!/^\d+(\.\d+)?$/.test(s)) { return null; }
    return parseFloat(s);
  }
  /* Porcentaje del email sobre el total. Devuelve {estado:"vacio"|"error"|"ok", p, tramo}. */
  function medirEmail(total, email) {
    var T = leerCifra(total), M = leerCifra(email);
    if (T === null || M === null || T <= 0) { return { estado: "vacio" }; }
    if (M > T) { return { estado: "error" }; }
    var p = Math.round((M / T) * 1000) / 10;
    return { estado: "ok", p: p, tramo: p < 30 ? "bajo" : (p <= 40 ? "medio" : "alto") };
  }

  /* BANDEJA · la cifra mientras «cuenta»: mismo formato que el texto final («4.000.000 €», «92,4 %», «72 h»).
     t va de 0 a 1; con t = 1 devuelve el texto tal cual. */
  function contarCifra(texto, t) {
    var m = String(texto).match(/^(\D*)([\d.]+(?:,\d+)?)(.*)$/);
    if (!m || t >= 1) { return String(texto); }
    var num = m[2], dec = (num.split(",")[1] || "").length;
    var valor = parseFloat(num.replace(/\./g, "").replace(",", "."));
    var v = valor * Math.max(0, t);
    var ent = Math.floor(v), resto = dec ? (v - ent).toFixed(dec).slice(2) : "";
    var miles = String(ent).replace(/\B(?=(\d{3})+(?!\d))/g, num.indexOf(".") > -1 ? "." : "");
    return m[1] + miles + (dec ? "," + resto : "") + m[3];
  }

  return { contarCifra: contarCifra, nivelDiagnostico: nivelDiagnostico, piezasQueFaltan: piezasQueFaltan, correoDiagnostico: correoDiagnostico, leerCifra: leerCifra, medirEmail: medirEmail, progresoRuta: progresoRuta, nodosEncendidos: nodosEncendidos, trazo: trazo, debeMostrarFlota: debeMostrarFlota, construirEvento: construirEvento, debePreguntarCookies: debePreguntarCookies, mensajeCopia: mensajeCopia };
});
