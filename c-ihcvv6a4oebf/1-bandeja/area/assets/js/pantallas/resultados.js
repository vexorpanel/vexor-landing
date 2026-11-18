/* Pantalla: Resultados e informes. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function render(o) {
    var estructura = o.vista !== 'vacio';

    var resumen = estructura
      ? '<dl class="metricas-fila metricas-fila-cuatro">' +
        c.metrica({ etiqueta: 'Ventas atribuidas al email', nota: 'En euros.' }) +
        c.metrica({ etiqueta: 'Porcentaje atribuido al email' }) +
        c.metrica({ etiqueta: 'Aperturas' }) +
        c.metrica({ etiqueta: 'Clics' }) + '</dl>'
      : '';

    var porOrigen = c.tabla({
      vista: o.vista,
      caption: 'Resultados del email por origen: bienvenida, automatizaciones y campañas',
      columnas: [
        { clave: 'origen', titulo: 'Origen' },
        { clave: 'ventas', titulo: 'Ventas (euros)', clase: 'num' },
        { clave: 'aperturas', titulo: 'Aperturas', clase: 'num' },
        { clave: 'clics', titulo: 'Clics', clase: 'num' },
        { clave: 'conversiones', titulo: 'Compras', clase: 'num' }
      ],
      filas: 3,
      vacioDe: {
        icono: 'resultados',
        titulo: 'Aún no hay resultados que enseñar',
        texto: 'Los resultados se cargan una vez al mes, cuando el mes ha terminado. Aparecerán aquí, siempre en euros.'
      }
    });

    var botonInforme = c.boton({ tipo: 'secundario', texto: 'Descargar informe', accion: 'sinconexion', valor: 'descarga', icono: 'descargar' });
    var informes = c.tabla({
      vista: o.vista,
      caption: 'Informes mensuales en PDF',
      columnas: [
        { clave: 'mes', titulo: 'Mes' },
        { clave: 'descarga', titulo: 'Informe' }
      ],
      celdas: { descarga: botonInforme },
      filas: 3,
      vacioDe: {
        icono: 'facturas',
        titulo: 'Sin informes todavía',
        texto: 'Cada mes completo tendrá su informe en PDF, para descargar o reenviar.'
      }
    });

    return c.cabecera({
      eyebrow: 'Qué ha vendido el email',
      titulo: 'Resultados e informes',
      lead: 'Las cifras de cada mes, siempre en euros, y el informe para descargar.',
      vista: o.vista
    }) +
      resumen +
      '<section class="seccion" aria-labelledby="h-origen"><h2 id="h-origen" class="h-seccion">Resultados por origen</h2>' + porOrigen + '</section>' +
      '<section class="seccion" aria-labelledby="h-informes"><h2 id="h-informes" class="h-seccion">Informes mensuales</h2>' + informes + '</section>' +
      '<p class="nota-decision">' + c.icono('info') + '<span>Si una tienda cobra en otra moneda, la cifra solo se enseñará cuando esté convertida a euros. Si no se puede, verás un guion, nunca un número dudoso.</span></p>' +
      c.desplegableFuentes('resultados');
  }

  return { id: 'resultados', render: render };
});
