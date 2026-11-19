/* Pantalla: Calendario de envíos. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function filtros() {
    function f(texto, pulsado) {
      return '<button type="button" class="seg-opcion" data-accion="filtro" aria-pressed="' + (pulsado ? 'true' : 'false') + '">' + c.esc(texto) + '</button>';
    }
    return '<div class="seg seg-ancho" role="group" aria-label="Filtrar envíos por estado">' +
      f('Todos', true) + f('En preparación', false) + f('Programados', false) + f('Enviados', false) + '</div>';
  }

  function lista(titulo, idTitulo) {
    var filas = '';
    for (var i = 0; i < 3; i++) filas += '<li><span class="lista-lineas-dato">' + c.dash() + '</span><span class="lista-lineas-dato">' + c.dash() + '</span></li>';
    return '<ul class="lista-lineas" aria-labelledby="' + idTitulo + '">' + filas + '</ul>';
  }

  function render(o) {
    var tabla = c.tabla({
      vista: o.vista,
      caption: 'Envíos programados y pasados de tu tienda',
      columnas: [
        { clave: 'fecha', titulo: 'Fecha de envío' },
        { clave: 'asunto', titulo: 'Asunto' },
        { clave: 'tipo', titulo: 'Tipo' },
        { clave: 'estado', titulo: 'Estado' }
      ],
      filas: 4,
      vacioDe: {
        icono: 'calendario',
        titulo: 'Todavía no hay envíos en el calendario',
        texto: 'Cuando haya una campaña programada, aparecerá aquí con su fecha, su asunto y su estado.'
      }
    });

    var lateral = o.vista === 'vacio'
      ? c.vacio({ mini: true, icono: 'calendario', titulo: 'Sin fechas todavía', texto: 'Las fechas comerciales de tu país aparecerán aquí.' })
      : '<section class="bloque" aria-labelledby="h-fechas"><h2 id="h-fechas" class="h-seccion">Fechas comerciales de tu país</h2>' + lista('Fechas comerciales', 'h-fechas') + '</section>' +
        '<section class="bloque" aria-labelledby="h-auto"><h2 id="h-auto" class="h-seccion">Automatizaciones activas</h2>' + lista('Automatizaciones', 'h-auto') + '</section>';

    return c.cabecera({
      eyebrow: 'Qué sale y cuándo',
      titulo: 'Calendario de envíos',
      lead: 'Todo lo que vamos a mandar a tus clientes, en orden.',
      vista: o.vista
    }) +
      '<div class="dos-col">' +
      '<section class="col-principal" aria-labelledby="h-envios"><h2 id="h-envios" class="h-seccion">Envíos</h2>' +
      (o.vista === 'vacio' ? '' : filtros()) + tabla + '</section>' +
      '<aside class="col-lateral" aria-label="Fechas y automatizaciones">' + lateral + '</aside>' +
      '</div>' +
      c.desplegableFuentes('calendario');
  }

  return { id: 'calendario', render: render };
});
