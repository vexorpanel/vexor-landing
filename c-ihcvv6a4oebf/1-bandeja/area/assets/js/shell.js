/* El marco de la página (menús, cabecera, zona de contenido), sin tocar el navegador.
 * Devuelve texto HTML: app.js lo pone en la página, y la comprobación estática lo valida en Node. */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica(
    typeof module === 'object' && module.exports ? require('./componentes.js') : raiz.VX.componentes,
    typeof module === 'object' && module.exports ? require('./rutas.js') : raiz.VX.rutas
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.VX = raiz.VX || {};
    raiz.VX.shell = api;
  }
})(typeof self !== 'undefined' ? self : this, function (c, rutas) {
  'use strict';

  var LOGO = '<img src="assets/brand/vexor-logo.webp" width="520" height="179" alt="Vexor Consulting">';
  var VOLVER_A_LA_WEB = '../';
  var EN_MAS = ['mas', 'facturas', 'equipo', 'ajustes'];

  function enlace(r, actual, corto) {
    var activo = r.id === actual;
    return '<a class="nav-item" href="' + c.esc(rutas.direccion(r.id)) + '"' + (activo ? ' aria-current="page"' : '') + '>' +
      c.icono(r.icono) + '<span>' + c.esc(corto && r.corto ? r.corto : r.titulo) + '</span></a>';
  }

  function menuLateral(items, actual) {
    var principal = items.filter(function (r) { return r.nav === 'principal'; });
    var secundaria = items.filter(function (r) { return r.nav === 'secundaria'; });
    function lista(arr) { return arr.map(function (r) { return '<li>' + enlace(r, actual, false) + '</li>'; }).join(''); }
    return '<nav class="nav-lateral" aria-label="Principal">' +
      '<ul class="nav-lista">' + lista(principal) + '</ul>' +
      '<p class="nav-grupo" id="nav-grupo-cuenta">Tu cuenta</p>' +
      '<ul class="nav-lista" aria-labelledby="nav-grupo-cuenta">' + lista(secundaria) + '</ul></nav>';
  }

  function barraInferior(items, actual) {
    var principal = items.filter(function (r) { return r.nav === 'principal'; });
    var li = principal.map(function (r) { return '<li>' + enlace(r, actual, true) + '</li>'; }).join('');
    var masActivo = EN_MAS.indexOf(actual) !== -1;
    li += '<li><a class="nav-item" href="' + rutas.direccion('mas') + '"' + (masActivo ? ' aria-current="page"' : '') + '>' +
      c.icono('mas') + '<span>Más</span></a></li>';
    return '<nav class="barra-inferior" aria-label="Principal, móvil"><ul class="barra-lista">' + li + '</ul></nav>';
  }

  /**
   * Marco completo de una pantalla.
   *   ruta: la ruta ya resuelta · menuItems: lo que su perfil puede ver · contenido: HTML de la pantalla
   */
  function marco(o) {
    var id = o.ruta.id;

    if (id === 'entrada') {
      return '<main id="contenido" class="contenido contenido-completo" tabindex="-1">' + o.contenido + '</main>';
    }

    if (id === 'interno') {
      return '<div class="layout layout-simple"><header class="cabecera-movil cabecera-simple">' +
        '<a class="cabecera-logo" href="' + rutas.direccion('interno') + '">' + LOGO + '</a></header>' +
        '<main id="contenido" class="contenido" tabindex="-1">' + o.contenido + '</main></div>';
    }

    return '<div class="layout">' +
      '<aside class="lateral">' +
      '<a class="lateral-logo" href="' + rutas.direccion('inicio') + '" aria-label="Vexor Consulting, inicio">' + LOGO + '</a>' +
      '<p class="lateral-tienda"><span class="sr">Tienda: </span>Tu tienda</p>' +
      menuLateral(o.menuItems, id) +
      '<div class="lateral-pie">' +
      c.boton({ tipo: 'texto', texto: 'Volver a la web', href: VOLVER_A_LA_WEB, icono: 'volver' }) +
      c.boton({ tipo: 'texto', texto: 'Cerrar sesión', accion: 'salir', icono: 'salir' }) +
      '</div></aside>' +
      '<div class="cuerpo">' +
      '<header class="cabecera-movil"><a class="cabecera-logo" href="' + rutas.direccion('inicio') + '" aria-label="Vexor Consulting, inicio">' + LOGO + '</a>' +
      '<p class="cabecera-tienda"><span class="sr">Tienda: </span>Tu tienda</p></header>' +
      '<main id="contenido" class="contenido" tabindex="-1">' + o.contenido + '</main>' +
      '</div>' +
      barraInferior(o.menuItems, id) +
      '</div>';
  }

  return Object.freeze({ marco: marco, VOLVER_A_LA_WEB: VOLVER_A_LA_WEB });
});
