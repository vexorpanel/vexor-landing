/* Pantalla: Facturas. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function render(o) {
    var tabla = c.tabla({
      vista: o.vista,
      caption: 'Facturas de tu tienda',
      columnas: [
        { clave: 'numero', titulo: 'Número' },
        { clave: 'fecha', titulo: 'Fecha' },
        { clave: 'concepto', titulo: 'Concepto' },
        { clave: 'importe', titulo: 'Importe (euros)', clase: 'num' },
        { clave: 'estado', titulo: 'Estado' },
        { clave: 'pdf', titulo: 'Factura' }
      ],
      celdas: { pdf: c.boton({ tipo: 'secundario', texto: 'Descargar', accion: 'sinconexion', valor: 'descarga', icono: 'descargar' }) },
      filas: 3,
      vacioDe: {
        icono: 'facturas',
        titulo: 'Todavía no tienes facturas aquí',
        texto: 'Cuando emitamos una factura, la verás aquí con su PDF. Solo aparecen las enviadas y las pagadas.'
      }
    });

    return c.cabecera({
      eyebrow: 'Lo que nos has pagado',
      titulo: 'Facturas',
      lead: 'Todas tus facturas, para descargar cuando las necesites.',
      vista: o.vista
    }) +
      '<section class="seccion" aria-labelledby="h-facturas"><h2 id="h-facturas" class="h-seccion">Tus facturas</h2>' + tabla + '</section>' +
      '<p class="nota-decision nota-boceto">' + c.icono('info') + '<span><b>Nota del boceto.</b> Por decidir: si las facturas las lleva este panel o una gestoría.</span></p>' +
      c.desplegableFuentes('facturas');
  }

  return { id: 'facturas', render: render };
});
