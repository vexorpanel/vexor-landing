/* Pantalla: Inicio (resumen del mes). Todos los valores son «—» hasta que se conecte. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function grafico() {
    var barras = '';
    for (var i = 0; i < 6; i++) {
      barras += '<li class="grafico-col"><span class="grafico-barra"></span><span class="grafico-mes">' + c.dash() + '</span></li>';
    }
    return '<div class="grafico" role="img" aria-label="Ventas de los últimos seis meses: todavía sin datos">' +
      '<ol class="grafico-cols" aria-hidden="true">' + barras + '</ol></div>';
  }

  function render(o) {
    var estructura = o.vista !== 'vacio';

    var principal = estructura
      ? '<dl class="metricas-fila metricas-fila-uno">' +
        c.metrica({ etiqueta: 'Ventas atribuidas al email', nota: 'En euros, del último mes cerrado.', grande: true }) +
        '</dl>' + grafico() +
        '<dl class="metricas-fila">' +
        c.metrica({ etiqueta: 'Porcentaje atribuido al email' }) +
        c.metrica({ etiqueta: 'Aperturas' }) +
        c.metrica({ etiqueta: 'Clics' }) +
        '</dl>'
      : c.vacio({
        icono: 'resultados',
        titulo: 'Aún no hay ventas que enseñar',
        texto: 'Cuando se conecte tu tienda, aquí verás lo que ha vendido el email cada mes, en euros.'
      });

    var siguiente = estructura
      ? '<dl class="datos-lista">' +
        '<div><dt>Fecha</dt><dd>' + c.dash() + '</dd></div>' +
        '<div><dt>Asunto</dt><dd>' + c.dash() + '</dd></div>' +
        '<div><dt>Estado</dt><dd>' + c.dash() + '</dd></div></dl>'
      : c.vacio({ mini: true, icono: 'calendario', titulo: 'Nada programado', texto: 'El próximo envío aparecerá aquí.' });

    var pendientes = estructura
      ? '<dl class="datos-lista"><div><dt>Piezas por aprobar</dt><dd>' + c.dash() + '</dd></div></dl>'
      : c.vacio({ mini: true, icono: 'piezas', titulo: 'Nada pendiente', texto: 'Lo que necesite tu visto bueno aparecerá aquí.' });

    var informe = estructura
      ? '<dl class="datos-lista"><div><dt>Informe del mes</dt><dd>' + c.dash() + '</dd></div></dl>'
      : c.vacio({ mini: true, icono: 'facturas', titulo: 'Sin informes todavía', texto: 'El primero llegará cuando haya un mes completo.' });

    return c.cabecera({
      eyebrow: 'Resumen del mes',
      titulo: 'Inicio',
      lead: 'Lo importante de tu tienda en un vistazo.',
      vista: o.vista
    }) +
      '<div class="inicio-grid">' +
      '<section class="panel-doble" aria-labelledby="h-ventas"><div class="panel-doble-nucleo">' +
      '<h2 id="h-ventas" class="h-seccion">Lo que ha vendido el email</h2>' + principal +
      '</div></section>' +
      '<div class="inicio-lateral">' +
      '<section class="bloque" aria-labelledby="h-siguiente"><h2 id="h-siguiente" class="h-seccion">Siguiente envío</h2>' + siguiente +
      (estructura ? '<p class="bloque-pie">' + c.boton({ tipo: 'texto', texto: 'Ver el calendario', href: '#/calendario', icono: 'derecha' }) + '</p>' : '') + '</section>' +
      '<section class="bloque" aria-labelledby="h-pend"><h2 id="h-pend" class="h-seccion">Esperan tu visto bueno</h2>' + pendientes +
      (estructura ? '<p class="bloque-pie">' + c.boton({ tipo: 'texto', texto: 'Ver las piezas', href: '#/piezas', icono: 'derecha' }) + '</p>' : '') + '</section>' +
      '<section class="bloque" aria-labelledby="h-inf"><h2 id="h-inf" class="h-seccion">Último informe</h2>' + informe +
      (estructura ? '<p class="bloque-pie">' + c.boton({ tipo: 'secundario', texto: 'Descargar informe', accion: 'sinconexion', valor: 'descarga', icono: 'descargar' }) + '</p>' : '') + '</section>' +
      '</div></div>' +
      c.desplegableFuentes('inicio');
  }

  return { id: 'inicio', render: render };
});
