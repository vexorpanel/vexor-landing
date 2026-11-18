/* Pantalla: «Más» (menú del móvil con lo que no cabe en la barra de abajo). */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(
    typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes,
    typeof module === 'object' && module.exports ? require('../rutas.js') : raiz.VX.rutas
  );
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c, rutas) {
  'use strict';

  function render() {
    var items = rutas.RUTAS.filter(function (r) { return r.nav === 'secundaria'; }).map(function (r) {
      return '<li><a class="fila-enlace" href="' + c.esc(rutas.direccion(r.id)) + '">' +
        c.icono(r.icono) + '<span>' + c.esc(r.titulo) + '</span>' + c.icono('chevron', 'fila-enlace-flecha') + '</a></li>';
    }).join('');

    return c.cabecera({ eyebrow: 'Más', titulo: 'Más opciones', lead: 'El resto de tu cuenta.' }) +
      '<ul class="lista-enlaces">' + items +
      '<li><a class="fila-enlace" href="../">' + c.icono('volver') + '<span>Volver a la web</span>' + c.icono('chevron', 'fila-enlace-flecha') + '</a></li>' +
      '<li><button type="button" class="fila-enlace" data-accion="salir">' + c.icono('salir') + '<span>Cerrar sesión</span></button></li>' +
      '</ul>';
  }

  return { id: 'mas', render: render };
});
