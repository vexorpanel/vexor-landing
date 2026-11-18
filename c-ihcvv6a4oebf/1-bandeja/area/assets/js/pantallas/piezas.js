/* Pantalla: Piezas pendientes de aprobar. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function pestanas() {
    function f(texto, pulsado) {
      return '<button type="button" class="seg-opcion" data-accion="filtro" aria-pressed="' + (pulsado ? 'true' : 'false') + '">' + c.esc(texto) + '</button>';
    }
    return '<div class="seg seg-ancho" role="group" aria-label="Filtrar piezas por estado">' +
      f('Por aprobar', true) + f('Aprobadas', false) + f('Con cambios', false) + '</div>';
  }

  function pieza(i) {
    return '<li class="pieza">' +
      '<div class="pieza-img" role="img" aria-label="Aquí irá la imagen de la pieza">' + c.icono('imagen') + '</div>' +
      '<div class="pieza-cuerpo">' +
      '<h3 class="pieza-titulo">' + c.dash() + '</h3>' +
      '<dl class="datos-lista datos-lista-fila">' +
      '<div><dt>Se enviará el</dt><dd>' + c.dash() + '</dd></div>' +
      '<div><dt>Estado</dt><dd>' + c.dash() + '</dd></div></dl>' +
      '<div class="pieza-acciones">' +
      c.boton({ tipo: 'primario', texto: 'Aprobar', accion: 'sinconexion', valor: 'aprobar', icono: 'visto' }) +
      c.boton({ tipo: 'secundario', texto: 'Pedir cambios', accion: 'sinconexion', valor: 'cambios', icono: 'mensaje' }) +
      '</div></div></li>';
  }

  function render(o) {
    var lista = o.vista === 'vacio'
      ? c.vacio({
        icono: 'piezas',
        titulo: 'No hay nada esperando tu visto bueno',
        texto: 'Cuando preparemos un envío para que lo revises, lo verás aquí con su imagen y dos botones: aprobar o pedir cambios.'
      })
      : pestanas() + '<ul class="piezas-lista">' + pieza(0) + pieza(1) + pieza(2) + '</ul>';

    var lateral = '<h2 id="h-como" class="h-seccion">Cómo funcionará</h2>' +
      '<ol class="pasos" aria-labelledby="h-como">' +
      '<li><span><strong>Miras la pieza.</strong> La ves tal como la recibirán tus clientes.</span></li>' +
      '<li><span><strong>Aprobar o pedir cambios.</strong> Si pides cambios, escribes qué quieres distinto.</span></li>' +
      '<li><span><strong>Queda guardado.</strong> Quién respondió, cuándo y qué dijo.</span></li>' +
      '</ol>' +
      '<p class="nota-decision nota-boceto">' + c.icono('info') + '<span><b>Nota del boceto.</b> Por decidir: si se aprueba aquí o donde se hace hoy.</span></p>';

    return c.cabecera({
      eyebrow: 'Qué esperamos de ti',
      titulo: 'Piezas por aprobar',
      lead: 'Revisa cada envío antes de que salga.',
      vista: o.vista
    }) +
      '<div class="dos-col">' +
      '<section class="col-principal" aria-labelledby="h-piezas"><h2 id="h-piezas" class="h-seccion">Tus piezas</h2>' + lista + '</section>' +
      '<aside class="col-lateral" aria-label="Cómo funciona la aprobación">' + lateral + '</aside>' +
      '</div>' +
      c.desplegableFuentes('piezas');
  }

  return { id: 'piezas', render: render };
});
