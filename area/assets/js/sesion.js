/* Sesión DE BOCETO. No es una sesión real: no hay contraseña, ni servidor, ni datos.
 *
 * Qué hace: deja elegir entre tres perfiles inventados para poder ver cómo reacciona el área
 * (cliente activo, cliente de baja, equipo de Vexor). De la sesión solo se guarda el nombre del
 * perfil, y cada vez que se carga se vuelve a comprobar si ese perfil puede entrar: así se ve
 * cómo se cortaría el acceso de una baja aunque tuviera la sesión abierta.
 *
 * En el área real la sesión vive en el servidor (cookie httpOnly) y el navegador NO decide nada.
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
    raiz.VX.sesion = api;
  }
})(typeof self !== 'undefined' ? self : this, function (permisos) {
  'use strict';

  var CLAVE = 'vx-boceto-perfil';
  var CLAVE_VISTA = 'vx-boceto-vista';
  var VISTAS = Object.freeze(['estructura', 'vacio']);

  /** Datos de la «base de datos» del boceto: identificadores inventados. */
  var CONTEXTO_DEMO = Object.freeze({
    clientes: Object.freeze({
      'cliente-a': Object.freeze({ estado: 'active' }),
      'cliente-b': Object.freeze({ estado: 'active' }),
      'cliente-baja': Object.freeze({ estado: 'archived' })
    })
  });

  var PERFILES = Object.freeze({
    'cliente-activo': Object.freeze({
      etiqueta: 'Cliente con acceso',
      ayuda: 'Lo que vería una tienda que sigue con nosotros.',
      usuario: Object.freeze({ id: 'usuario-a1', rol: 'cliente', clienteId: 'cliente-a', activo: true })
    }),
    'cliente-baja': Object.freeze({
      etiqueta: 'Cliente de baja',
      ayuda: 'Para ver cómo se le cierra el acceso.',
      usuario: Object.freeze({ id: 'usuario-z1', rol: 'cliente', clienteId: 'cliente-baja', activo: true })
    }),
    equipo: Object.freeze({
      etiqueta: 'Equipo de Vexor',
      ayuda: 'Lo que ve alguien del equipo: sigue usando el panel de siempre.',
      usuario: Object.freeze({ id: 'usuario-i1', rol: 'member', clienteId: null, activo: true })
    })
  });

  var PERFIL_POR_DEFECTO = 'cliente-activo';

  function esPerfil(id) {
    return typeof id === 'string' && Object.prototype.hasOwnProperty.call(PERFILES, id);
  }

  /**
   * «Entrar» del boceto. Devuelve { ok, sesion, motivo }.
   * Aunque el perfil exista, vuelve a preguntar al modelo de permisos si puede entrar.
   */
  function entrar(perfilId) {
    if (!esPerfil(perfilId)) return { ok: false, sesion: null, motivo: 'perfil-desconocido' };
    var usuario = PERFILES[perfilId].usuario;
    if (!permisos.puedeEntrar(usuario, CONTEXTO_DEMO)) {
      return { ok: false, sesion: null, motivo: permisos.motivoDeNoEntrar(usuario, CONTEXTO_DEMO) || 'acceso-cerrado' };
    }
    return { ok: true, sesion: { perfil: perfilId, usuario: usuario }, motivo: null };
  }

  /** Normaliza la vista del boceto: cualquier cosa rara vuelve a «estructura». */
  function vistaValida(v) {
    return VISTAS.indexOf(v) !== -1 ? v : 'estructura';
  }

  /** Lectura/escritura en el almacén del navegador, a prueba de que no exista o falle. */
  function leer(almacen, clave) {
    try { return almacen && almacen.getItem(clave); } catch (e) { return null; }
  }
  function escribir(almacen, clave, valor) {
    try {
      if (!almacen) return;
      if (valor === null) almacen.removeItem(clave); else almacen.setItem(clave, valor);
    } catch (e) { /* sin almacén: el boceto funciona igual, solo no recuerda */ }
  }

  function recuperar(almacen) {
    var id = leer(almacen, CLAVE);
    if (!id) return null;
    var r = entrar(id);
    return r.ok ? r.sesion : null; // si ya no puede entrar, la sesión guardada no vale
  }
  function guardar(almacen, sesion) {
    escribir(almacen, CLAVE, sesion ? sesion.perfil : null);
  }

  return Object.freeze({
    CONTEXTO_DEMO: CONTEXTO_DEMO,
    PERFILES: PERFILES,
    PERFIL_POR_DEFECTO: PERFIL_POR_DEFECTO,
    VISTAS: VISTAS,
    CLAVE: CLAVE,
    CLAVE_VISTA: CLAVE_VISTA,
    esPerfil: esPerfil,
    entrar: entrar,
    vistaValida: vistaValida,
    leer: leer,
    escribir: escribir,
    recuperar: recuperar,
    guardar: guardar
  });
});
