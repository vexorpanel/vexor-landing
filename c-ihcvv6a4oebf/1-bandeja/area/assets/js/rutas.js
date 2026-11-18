/* Rutas del boceto y la regla que decide a qué pantalla va cada persona.
 *
 * Función pura: recibe la dirección (#/facturas…), la sesión y los datos, y devuelve a qué
 * pantalla ir. Así se prueba sin navegador (pruebas/rutas.test.js).
 *
 * Reglas (con su porqué):
 *  - Sin sesión, todo lleva a la entrada. ¿Por qué? Una dirección guardada en favoritos no es una llave.
 *  - Una dirección que no existe vuelve al inicio. ¿Por qué? Nadie se queda en una página en blanco
 *    ni descubre qué rutas existen probando nombres.
 *  - Lo que viene detrás del «?» de la dirección se ignora. ¿Por qué? El cliente sale de la sesión.
 *  - Si la tienda pasa a baja con la sesión abierta, la siguiente pantalla ya no se abre.
 */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica(
    typeof module === 'object' && module.exports ? require('./permisos.js') : raiz.VX.permisos
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.VX = raiz.VX || {};
    raiz.VX.rutas = api;
  }
})(typeof self !== 'undefined' ? self : this, function (permisos) {
  'use strict';

  /**
   * Todas las pantallas que existen. `recurso` es lo que se le pregunta al modelo de permisos.
   * `nav`: en qué menú aparece. `soloMovil`: pantalla de menú que solo tiene sentido en el móvil.
   */
  var RUTAS = Object.freeze([
    { id: 'entrada', titulo: 'Entrar', publica: true },
    { id: 'inicio', titulo: 'Inicio', recurso: 'inicio', nav: 'principal', icono: 'inicio' },
    { id: 'calendario', titulo: 'Calendario de envíos', corto: 'Calendario', recurso: 'calendario', nav: 'principal', icono: 'calendario' },
    { id: 'piezas', titulo: 'Piezas por aprobar', corto: 'Piezas', recurso: 'piezas', nav: 'principal', icono: 'piezas' },
    { id: 'resultados', titulo: 'Resultados e informes', corto: 'Resultados', recurso: 'resultados', nav: 'principal', icono: 'resultados' },
    { id: 'facturas', titulo: 'Facturas', recurso: 'facturas', nav: 'secundaria', icono: 'facturas' },
    { id: 'equipo', titulo: 'Tu equipo y contacto', corto: 'Tu equipo', recurso: 'equipo', nav: 'secundaria', icono: 'equipo' },
    { id: 'ajustes', titulo: 'Ajustes', recurso: 'ajustes', nav: 'secundaria', icono: 'ajustes' },
    { id: 'mas', titulo: 'Más', recurso: 'inicio', soloMovil: true, icono: 'mas' },
    { id: 'interno', titulo: 'Equipo de Vexor', soloInterno: true }
  ]);

  var IDS = RUTAS.map(function (r) { return r.id; });

  function buscar(id) {
    for (var i = 0; i < RUTAS.length; i++) if (RUTAS[i].id === id) return RUTAS[i];
    return null;
  }

  /** «#/facturas?cliente=otro» -> «facturas». Solo cuenta la parte de antes del «?». */
  function idDeDireccion(hash) {
    var h = typeof hash === 'string' ? hash : '';
    var corte = h.search(/[?&]/);
    if (corte !== -1) h = h.slice(0, corte);
    var m = /^#?\/?([a-z0-9-]*)\/?$/.exec(h);
    if (!m) return '';
    return m[1];
  }

  function direccion(id) {
    return '#/' + id;
  }

  function esInterno(usuario) {
    return !!usuario && permisos.ROLES_INTERNOS.indexOf(usuario.rol) !== -1;
  }

  /**
   * Decide a qué pantalla va esta persona.
   * Devuelve { ruta, redirigir, motivo }:  `redirigir` es la dirección a la que hay que cambiar
   * (o null si la dirección pedida ya es la buena); `motivo` solo se rellena en los cortes.
   */
  function resolver(hash, sesion, contexto) {
    var pedido = idDeDireccion(hash);
    var usuario = sesion && sesion.usuario;

    function ir(id, motivo) {
      var dir = direccion(id);
      return { ruta: buscar(id), redirigir: hash === dir ? null : dir, motivo: motivo || null };
    }

    // Sin sesión: solo se ve la entrada.
    if (!usuario) return ir('entrada', null);

    // Con sesión, pero ya no puede entrar (baja, usuario desactivado): se corta y se sale.
    if (!permisos.puedeEntrar(usuario, contexto)) {
      return ir('entrada', permisos.motivoDeNoEntrar(usuario, contexto) || 'acceso-cerrado');
    }

    // El equipo interno entra por el panel de siempre; aquí solo ve un aviso.
    if (esInterno(usuario)) return ir('interno', null);

    // De aquí en adelante, es un cliente activo.
    if (pedido === 'entrada' || pedido === '' || IDS.indexOf(pedido) === -1) return ir('inicio', null);
    var ruta = buscar(pedido);
    if (ruta.soloInterno) return ir('inicio', null);
    if (!ruta.recurso) return ir('inicio', null);

    var permitido = permisos.puede(usuario, 'ver', permisos.recursoPropio(usuario, ruta.recurso), contexto);
    if (!permitido) return ir('inicio', null);
    return ir(ruta.id, null);
  }

  /** Pantallas que se enseñan en cada menú, ya filtradas por permiso. */
  function menu(usuario, contexto) {
    return RUTAS.filter(function (r) {
      if (!r.nav || !r.recurso) return false;
      return permisos.puede(usuario, 'ver', permisos.recursoPropio(usuario, r.recurso), contexto);
    });
  }

  return Object.freeze({
    RUTAS: RUTAS,
    IDS: IDS,
    buscar: buscar,
    idDeDireccion: idDeDireccion,
    direccion: direccion,
    resolver: resolver,
    menu: menu
  });
});
