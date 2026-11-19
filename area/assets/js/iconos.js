/* Iconos de línea fina (trazo 1,5) dibujados a mano, sin librerías.
 * Siempre decorativos: van con aria-hidden y el texto de al lado dice lo mismo. */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.VX = raiz.VX || {};
    raiz.VX.iconos = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TRAZOS = Object.freeze({
    inicio: 'M3.5 10.5 12 3.5l8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5V15h-5v5.5H5A1.5 1.5 0 0 1 3.5 19z',
    calendario: 'M5.5 4.5h13A1.5 1.5 0 0 1 20 6v12.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5V6a1.5 1.5 0 0 1 1.5-1.5zM4 9.5h16M8.5 2.75V6M15.5 2.75V6',
    piezas: 'M5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4zM8.5 12.5l2.5 2.5 4.5-5',
    resultados: 'M4 4v16h16M8.5 16v-4M12.5 16V8.5M16.5 16v-6.5',
    facturas: 'M6 3.5h12v17l-3-2-3 2-3-2-3 2zM9 8.5h6M9 12.5h6',
    equipo: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.3a3 3 0 0 1 0 5.4M17.5 14.3a5.5 5.5 0 0 1 3 5.2',
    ajustes: 'M4 8h16M4 16h16M9 5.5v5M15 13.5v5',
    mas: 'M6 12h.01M12 12h.01M18 12h.01',
    flecha: 'M7.5 16.5l9-9M8.5 7.5h8v8',
    derecha: 'M5 12h14M13.5 6.5 19 12l-5.5 5.5',
    volver: 'M10.5 6l-6 6 6 6M5 12h14.5',
    candado: 'M6.5 11h11a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    descargar: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14',
    salir: 'M10 4.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H10M14 8l4 4-4 4M18 12H9.5',
    info: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM12 11v5M12 8h.01',
    imagen: 'M5.5 4.5h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM4.5 16l4.5-4.5 4 4 2.5-2.5 4 4M9 9h.01',
    visto: 'M5 12.5l4.5 4.5L19 7.5',
    reloj: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM12 7.5V12l3 2',
    escudo: 'M12 3.5l7 2.5v5.5c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6z',
    mensaje: 'M5 5.5h14a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H10l-4.5 3.5V16H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z',
    chevron: 'M9.5 6l6 6-6 6'
  });

  function icono(nombre, clase) {
    var d = Object.prototype.hasOwnProperty.call(TRAZOS, nombre) ? TRAZOS[nombre] : TRAZOS.info;
    return '<svg class="icono' + (clase ? ' ' + clase : '') + '" viewBox="0 0 24 24" width="24" height="24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="' + d + '"/></svg>';
  }

  return Object.freeze({ TRAZOS: TRAZOS, icono: icono });
});
