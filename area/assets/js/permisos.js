/* Modelo de permisos de REFERENCIA del área de clientes.
 *
 * Qué es: la regla de «quién puede ver qué», escrita como una función pura (sin base de datos,
 * sin navegador). Sirve de dos maneras: el boceto la usa para decidir qué pantalla se enseña, y
 * el día que se construya el área real, el servidor tiene que cumplir ESTAS mismas reglas
 * (y estas mismas pruebas, en pruebas/permisos.test.js).
 *
 * Reglas de oro (con su porqué):
 *  1. Se NIEGA POR DEFECTO. Lo que no está escrito en una lista, no se puede.
 *     ¿Por qué? Porque una pantalla o consulta nueva que nadie se acuerde de revisar nace cerrada,
 *     no abierta (así funciona ya la «jaula» del revisor en el panel: lista blanca).
 *  2. El CLIENTE sale de la SESIÓN, nunca de la dirección ni del formulario.
 *     ¿Por qué? Si el cliente se leyera de «?cliente=…», cambiar una letra en la barra del
 *     navegador bastaría para ver los datos de otro.
 *  3. Un cliente de baja, o un usuario desactivado, no puede nada, ni con la sesión abierta.
 *     ¿Por qué? Hoy el panel solo mira «activo» al entrar; una sesión abierta dura 7 días.
 *  4. El cliente no ve lo interno (cuotas, comisiones, notas, borradores de factura).
 *     ¿Por qué? Son datos de la agencia, no de la tienda.
 *
 * Código en formato que vale para el navegador (script normal) y para Node (require).
 */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.VX = raiz.VX || {};
    raiz.VX.permisos = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** Tipos de usuario que ya existen en el panel (migrations.js, tabla users) + el nuevo «cliente». */
  var ROLES = Object.freeze(['admin', 'member', 'revisor', 'cliente']);
  var ROLES_INTERNOS = Object.freeze(['admin', 'member', 'revisor']);

  /**
   * Lo que puede hacer un CLIENTE: recurso -> acciones permitidas.
   * Todo lo que no salga aquí está prohibido.
   */
  var CLIENTE_PUEDE = Object.freeze({
    inicio: Object.freeze(['ver']),
    calendario: Object.freeze(['ver']),
    piezas: Object.freeze(['ver', 'aprobar', 'pedir_cambios']),
    resultados: Object.freeze(['ver', 'descargar']),
    facturas: Object.freeze(['ver', 'descargar']),
    equipo: Object.freeze(['ver']),
    ajustes: Object.freeze(['ver', 'cambiar_password', 'cerrar_sesion'])
  });

  /** Estados de factura que un cliente puede ver (nunca borradores ni anuladas). */
  var FACTURA_VISIBLE_AL_CLIENTE = Object.freeze(['sent', 'paid']);

  /**
   * Lo interno. Se copia de cómo funciona hoy el panel, para no quitarle nada al equipo:
   *  - admin: todo.
   *  - member: todo menos lo que el código ya reserva a admin
   *    (archivar clientes, regenerar el enlace público, activar usuarios).
   *  - revisor: SOLO su lista cerrada (middleware/auth.js, REVISOR_ALLOW).
   */
  var INTERNO_RECURSOS = Object.freeze([
    'clientes_lista', 'clientes_ficha', 'kpis', 'facturas_todas', 'drive', 'reviews',
    'newsletters', 'flows', 'tareas', 'equipo_interno', 'klaviyo'
  ]);
  var SOLO_ADMIN = Object.freeze(['archivar_cliente', 'regenerar_enlace_publico', 'activar_usuario', 'claves_klaviyo']);
  var REVISOR_LISTA = Object.freeze({
    reviews: Object.freeze(['ver', 'crear', 'borrar']),
    drive: Object.freeze(['ver']),
    clientes_lista: Object.freeze(['ver']),
    ajustes_propios: Object.freeze(['ver', 'cambiar_password', 'cerrar_sesion'])
  });

  function esTexto(v) {
    return typeof v === 'string' && v.length > 0;
  }

  /** ¿El usuario existe y está activo? Un usuario desactivado no puede nada. */
  function usuarioValido(usuario) {
    return !!usuario && esTexto(usuario.id) && ROLES.indexOf(usuario.rol) !== -1 && usuario.activo === true;
  }

  /** ¿El cliente de este usuario sigue siendo cliente? («active» como en clients.status del panel.) */
  function clienteActivo(usuario, contexto) {
    if (!usuario || !esTexto(usuario.clienteId)) return false;
    var tabla = contexto && contexto.clientes;
    if (!tabla || typeof tabla !== 'object') return false; // sin datos del cliente, se niega
    var c = Object.prototype.hasOwnProperty.call(tabla, usuario.clienteId) ? tabla[usuario.clienteId] : null;
    return !!c && c.estado === 'active';
  }

  /** ¿Puede entrar al área, ahora mismo? Se vuelve a preguntar en CADA petición, no solo al entrar. */
  function puedeEntrar(usuario, contexto) {
    if (!usuarioValido(usuario)) return false;
    if (usuario.rol === 'cliente') return clienteActivo(usuario, contexto);
    return true;
  }

  /** Motivo en cristiano de por qué no entra (para el mensaje de pantalla; nunca revela más). */
  function motivoDeNoEntrar(usuario, contexto) {
    if (!usuario) return 'sin-sesion';
    if (!usuarioValido(usuario)) return 'acceso-cerrado';
    if (usuario.rol === 'cliente' && !clienteActivo(usuario, contexto)) return 'acceso-cerrado';
    return null;
  }

  /**
   * La pregunta central. Devuelve true solo si TODO cuadra; ante cualquier duda, false.
   *   usuario  = { id, rol, activo, clienteId? }          (sale de la sesión)
   *   accion   = 'ver' | 'descargar' | 'aprobar' ...
   *   recurso  = { tipo, clienteId?, usuarioId?, estado? } (sale de lo que se pide)
   *   contexto = { clientes: { <id>: { estado } } }        (sale de la base de datos)
   */
  function puede(usuario, accion, recurso, contexto) {
    if (!puedeEntrar(usuario, contexto)) return false;
    if (!esTexto(accion) || !recurso || !esTexto(recurso.tipo)) return false;

    if (usuario.rol === 'cliente') return clientePuede(usuario, accion, recurso);
    if (usuario.rol === 'admin') return true;
    if (usuario.rol === 'member') return SOLO_ADMIN.indexOf(accion) === -1 && SOLO_ADMIN.indexOf(recurso.tipo) === -1;
    if (usuario.rol === 'revisor') return revisorPuede(accion, recurso);
    return false;
  }

  function clientePuede(usuario, accion, recurso) {
    if (!Object.prototype.hasOwnProperty.call(CLIENTE_PUEDE, recurso.tipo)) return false;
    if (CLIENTE_PUEDE[recurso.tipo].indexOf(accion) === -1) return false;

    // Los ajustes son de la PERSONA, no de la tienda: solo los suyos.
    if (recurso.tipo === 'ajustes') return recurso.usuarioId === usuario.id;

    // Todo lo demás es de la TIENDA: tiene que ser exactamente la suya.
    if (!esTexto(recurso.clienteId) || recurso.clienteId !== usuario.clienteId) return false;

    // Facturas: nunca borradores ni anuladas. Si no se dice el estado, se niega.
    if (recurso.tipo === 'facturas' && accion === 'descargar') {
      return FACTURA_VISIBLE_AL_CLIENTE.indexOf(recurso.estado) !== -1;
    }
    return true;
  }

  function revisorPuede(accion, recurso) {
    var tipo = recurso.tipo === 'ajustes' ? 'ajustes_propios' : recurso.tipo;
    if (!Object.prototype.hasOwnProperty.call(REVISOR_LISTA, tipo)) return false;
    return REVISOR_LISTA[tipo].indexOf(accion) !== -1;
  }

  /**
   * El ÚNICO sitio por donde el cliente «elige» de quién son los datos: de la sesión.
   * Lo que venga en la dirección (?cliente=…, /facturas/otro-cliente) se IGNORA.
   */
  function clienteDeLaPeticion(sesion, _parametrosDeLaDireccion) {
    var u = sesion && sesion.usuario;
    if (!u || u.rol !== 'cliente' || !esTexto(u.clienteId)) return null;
    return u.clienteId;
  }

  /** Recurso «propio» de un cliente: lo que pinta cada pantalla del área. */
  function recursoPropio(usuario, tipo, extra) {
    var r = { tipo: tipo };
    if (usuario && usuario.rol === 'cliente') {
      r.clienteId = usuario.clienteId;
      r.usuarioId = usuario.id;
    }
    if (extra && typeof extra === 'object') {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k) && k !== 'clienteId' && k !== 'usuarioId') r[k] = extra[k];
      }
    }
    return r;
  }

  /**
   * Filtro por cliente para filas que vengan de una consulta. Es la red de seguridad:
   * aunque una consulta se escriba mal, lo de otro cliente no llega a pantalla.
   * Para un cliente sin clienteId devuelve vacío (negar por defecto).
   */
  function filtrarPorCliente(filas, usuario, contexto) {
    if (!Array.isArray(filas)) return [];
    if (!usuario || usuario.rol !== 'cliente') return [];
    if (!puedeEntrar(usuario, contexto)) return [];
    return filas.filter(function (f) {
      return !!f && f.clienteId === usuario.clienteId;
    });
  }

  /** Facturas que se le enseñan al cliente: las suyas y solo enviadas o pagadas. */
  function facturasVisibles(filas, usuario, contexto) {
    return filtrarPorCliente(filas, usuario, contexto).filter(function (f) {
      return FACTURA_VISIBLE_AL_CLIENTE.indexOf(f.estado) !== -1;
    });
  }

  return Object.freeze({
    ROLES: ROLES,
    ROLES_INTERNOS: ROLES_INTERNOS,
    CLIENTE_PUEDE: CLIENTE_PUEDE,
    FACTURA_VISIBLE_AL_CLIENTE: FACTURA_VISIBLE_AL_CLIENTE,
    INTERNO_RECURSOS: INTERNO_RECURSOS,
    SOLO_ADMIN: SOLO_ADMIN,
    REVISOR_LISTA: REVISOR_LISTA,
    puedeEntrar: puedeEntrar,
    motivoDeNoEntrar: motivoDeNoEntrar,
    puede: puede,
    clienteDeLaPeticion: clienteDeLaPeticion,
    recursoPropio: recursoPropio,
    filtrarPorCliente: filtrarPorCliente,
    facturasVisibles: facturasVisibles
  });
});
