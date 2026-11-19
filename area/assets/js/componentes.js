/* Piezas de pantalla reutilizables. Todas devuelven texto HTML y escapan lo que reciben.
 * No hay estilos en línea: todo el aspecto está en assets/css/area.css (listo para una política
 * de seguridad de contenido estricta el día que esto sea real). */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica(
    typeof module === 'object' && module.exports ? require('./iconos.js') : raiz.VX.iconos,
    typeof module === 'object' && module.exports ? require('./fuentes.js') : raiz.VX.fuentes
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.VX = raiz.VX || {};
    raiz.VX.componentes = api;
  }
})(typeof self !== 'undefined' ? self : this, function (iconos, fuentes) {
  'use strict';

  var icono = iconos.icono;

  function esc(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** El valor «sin dato». Un lector de pantalla dice «sin dato», no «raya». */
  function dash() {
    return '<span class="dato-vacio"><span aria-hidden="true">—</span><span class="sr">sin dato</span></span>';
  }

  function chip(tipo, texto) {
    var t = ['ok', 'aviso', 'info', 'neutro'].indexOf(tipo) === -1 ? 'neutro' : tipo;
    return '<span class="chip chip-' + t + '">' + esc(texto) + '</span>';
  }

  /**
   * Botón o enlace con aspecto de botón. `accion` es un nombre que app.js entiende (data-accion).
   * Un enlace usa <a href>; todo lo demás es <button type="button"> para que nunca envíe un formulario.
   */
  function boton(o) {
    var clase = 'btn btn-' + (o.tipo || 'secundario');
    var ico = o.icono ? icono(o.icono) : '';
    var interior = '<span>' + esc(o.texto) + '</span>' + ico;
    if (o.href) {
      return '<a class="' + clase + '" href="' + esc(o.href) + '">' + interior + '</a>';
    }
    return '<button type="button" class="' + clase + '" data-accion="' + esc(o.accion || '') + '"' +
      (o.valor ? ' data-valor="' + esc(o.valor) + '"' : '') + '>' + interior + '</button>';
  }

  /** Selector de cómo se ve el boceto: con la estructura rellena de guiones, o vacío del todo. */
  function selectorDeVista(vista) {
    function opcion(valor, texto) {
      var activo = vista === valor;
      return '<button type="button" class="seg-opcion" data-accion="vista" data-valor="' + valor + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' + esc(texto) + '</button>';
    }
    return '<div class="seg" role="group" aria-label="Cómo se ve esta pantalla en el boceto">' +
      opcion('estructura', 'Estructura') + opcion('vacio', 'Sin datos aún') + '</div>';
  }

  /** Cabecera de página: etiqueta pequeña, título, frase y el selector de vista. */
  function cabecera(o) {
    return '<header class="pag-cab">' +
      '<div class="pag-cab-texto">' +
      (o.eyebrow ? '<p class="eyebrow">' + esc(o.eyebrow) + '</p>' : '') +
      '<h1 id="titulo-pagina" class="pag-titulo" tabindex="-1">' + esc(o.titulo) + '</h1>' +
      (o.lead ? '<p class="lead">' + esc(o.lead) + '</p>' : '') +
      '</div>' +
      (o.vista ? '<div class="pag-cab-vista">' + selectorDeVista(o.vista) + '</div>' : '') +
      '</header>';
  }

  /** Estado vacío: dice qué va a haber aquí y cuándo aparecerá, sin prometer fechas. */
  function vacio(o) {
    return '<div class="vacio' + (o.mini ? ' vacio-mini' : '') + '">' +
      '<div class="vacio-icono">' + icono(o.icono || 'info') + '</div>' +
      '<div class="vacio-texto">' +
      '<h3 class="vacio-titulo">' + esc(o.titulo) + '</h3>' +
      '<p>' + esc(o.texto) + '</p>' +
      '</div>' +
      (o.accion ? '<div class="vacio-accion">' + o.accion + '</div>' : '') +
      '</div>';
  }

  /**
   * Tabla con sus columnas. En el móvil cada fila pasa a ser un bloque con su etiqueta.
   *   columnas: [{ clave, titulo, clase? }]   · celdas: objeto { clave: html } o nada (= guion)
   *   vista 'estructura': `filas` filas de guiones · vista 'vacio': el estado vacío de `vacioDe`.
   */
  function tabla(o) {
    if (o.vista === 'vacio') return vacio(o.vacioDe);
    var n = o.filas || 3;
    var cab = o.columnas.map(function (c) {
      return '<th scope="col" role="columnheader"' + (c.clase ? ' class="' + c.clase + '"' : '') + '>' + esc(c.titulo) + '</th>';
    }).join('');
    var cuerpo = '';
    for (var i = 0; i < n; i++) {
      cuerpo += '<tr role="row">' + o.columnas.map(function (c) {
        var contenido = o.celdas && o.celdas[c.clave] ? o.celdas[c.clave] : dash();
        return '<td role="cell" data-label="' + esc(c.titulo) + '"' + (c.clase ? ' class="' + c.clase + '"' : '') + '>' + contenido + '</td>';
      }).join('') + '</tr>';
    }
    // 5 columnas o más: necesita más ancho antes de pasar a bloques (ver el apartado 10 del CSS)
    var clase = 'tabla' + (o.columnas.length >= 5 ? ' tabla-ancha' : '');
    return '<div class="tabla-caja"><table class="' + clase + '" role="table">' +
      '<caption class="sr">' + esc(o.caption) + '</caption>' +
      '<thead role="rowgroup"><tr role="row">' + cab + '</tr></thead><tbody role="rowgroup">' + cuerpo + '</tbody></table></div>';
  }

  /** Dato grande con su etiqueta. El valor siempre es un guion en el boceto. */
  function metrica(o) {
    return '<div class="metrica' + (o.grande ? ' metrica-grande' : '') + '">' +
      '<dt class="metrica-etiqueta">' + esc(o.etiqueta) + '</dt>' +
      '<dd class="metrica-valor">' + dash() + '</dd>' +
      (o.nota ? '<dd class="metrica-nota">' + esc(o.nota) + '</dd>' : '') +
      '</div>';
  }

  /**
   * Desplegable «¿De dónde saldrá esto?». Lee la lista única de fuentes.js.
   * `idPantalla` es la clave de FUENTES (inicio, calendario…).
   */
  function desplegableFuentes(idPantalla) {
    var items = fuentes.FUENTES[idPantalla] || [];
    var filas = items.map(function (f) {
      var e = fuentes.ESTADOS[f.existe] || fuentes.ESTADOS.no;
      return '<tr role="row">' +
        '<td role="cell" data-label="Dato" class="f-dato">' + esc(f.dato) + '</td>' +
        '<td role="cell" data-label="Fuente">' + esc(f.fuente) + '</td>' +
        '<td role="cell" data-label="¿Existe hoy?">' + chip(e.tipo, e.texto) + '<span class="f-donde">' + esc(f.donde) + '</span></td>' +
        '<td role="cell" data-label="Qué falta">' + esc(f.falta) + '</td>' +
        '</tr>';
    }).join('');
    return '<details class="fuentes">' +
      '<summary>' + icono('info') + '<span>¿De dónde saldrá esto?</span>' + chip('aviso', 'Solo en el boceto') + icono('chevron', 'fuentes-flecha') + '</summary>' +
      '<div class="fuentes-cuerpo"><div class="tabla-caja"><table class="tabla tabla-ancha tabla-fuentes" role="table">' +
      '<caption class="sr">Fuente de cada dato de esta pantalla y si existe hoy</caption>' +
      '<thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Dato</th><th scope="col" role="columnheader">Fuente</th><th scope="col" role="columnheader">¿Existe hoy?</th><th scope="col" role="columnheader">Qué falta</th></tr></thead>' +
      '<tbody role="rowgroup">' + filas + '</tbody></table></div></div></details>';
  }

  return Object.freeze({
    esc: esc, dash: dash, chip: chip, boton: boton, icono: icono,
    selectorDeVista: selectorDeVista, cabecera: cabecera, vacio: vacio,
    tabla: tabla, metrica: metrica, desplegableFuentes: desplegableFuentes
  });
});
