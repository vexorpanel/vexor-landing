/* Pegamento con el navegador: pinta la pantalla que toca y atiende los botones.
 * Toda la lógica de «quién ve qué» está en permisos.js, rutas.js y sesion.js (con pruebas).
 * Aquí no se decide nada de seguridad. */
(function () {
  'use strict';

  var VX = window.VX;
  var permisos = VX.permisos, rutas = VX.rutas, sesionApi = VX.sesion, shell = VX.shell;
  var contexto = sesionApi.CONTEXTO_DEMO;

  var almacen = null;
  try { almacen = window.sessionStorage; } catch (e) { almacen = null; }

  var estado = {
    sesion: sesionApi.recuperar(almacen),
    vista: sesionApi.vistaValida(sesionApi.leer(almacen, sesionApi.CLAVE_VISTA)),
    motivo: null,
    ultimaRuta: null
  };

  var MENSAJES = {
    aprobar: 'En el área real, esto guardaría tu respuesta con tu nombre y la hora. En el boceto no se guarda nada.',
    cambios: 'En el área real, aquí escribirías qué quieres cambiar. En el boceto no hay formulario.',
    descarga: 'En el área real, aquí se descargaría el PDF. En el boceto no hay ficheros.',
    password: 'En el boceto no hay formulario de contraseña. En el área real se pedirá la actual y una nueva.',
    todas: 'En el área real, esto cerraría tus sesiones en otros aparatos.',
    escribir: 'En el área real, se abriría un mensaje para el equipo.'
  };

  var raiz = document.getElementById('app');
  var anuncio = document.getElementById('anuncio');
  var toast = document.getElementById('toast');
  var temporizador = null;

  function mostrarAviso(texto) {
    if (!toast) return;
    toast.textContent = texto;
    toast.hidden = false;
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(function () { toast.hidden = true; }, 7000);
  }

  function navegar(direccion) {
    if (window.location.hash === direccion) pintar({ cambioDeRuta: true });
    else window.location.hash = direccion;
  }

  function pintar(opciones) {
    var o = opciones || {};
    var r = rutas.resolver(window.location.hash, estado.sesion, contexto);

    // Si la sesión ya no puede entrar (baja con la sesión abierta), se cierra aquí mismo.
    if (r.motivo) {
      estado.sesion = null;
      sesionApi.guardar(almacen, null);
      estado.motivo = r.motivo;
    }
    if (r.redirigir) window.location.replace(r.redirigir); // sin añadir una entrada al historial

    var id = r.ruta.id;
    var pantalla = VX.pantallas[id];
    var usuario = estado.sesion && estado.sesion.usuario;
    var contenido = pantalla.render({
      vista: estado.vista,
      perfil: estado.sesion ? estado.sesion.perfil : sesionApi.PERFIL_POR_DEFECTO,
      motivo: id === 'entrada' ? estado.motivo : null
    });

    raiz.innerHTML = shell.marco({
      ruta: r.ruta,
      menuItems: usuario ? rutas.menu(usuario, contexto) : [],
      contenido: contenido
    });

    var titulo = (r.ruta.titulo || '') + ' · Área de clientes · Boceto';
    document.title = titulo;

    if (o.cambioDeRuta || estado.ultimaRuta !== id) {
      window.scrollTo(0, 0);
      var h1 = document.getElementById('titulo-pagina');
      if (h1) h1.focus({ preventScroll: true });
      if (anuncio) anuncio.textContent = titulo;
    }
    estado.ultimaRuta = id;
    document.documentElement.setAttribute('data-pantalla', id);
  }

  function accionEntrar() {
    var marcado = document.querySelector('input[name="perfil"]:checked');
    var r = sesionApi.entrar(marcado ? marcado.value : null);
    if (!r.ok) {
      var aviso = document.getElementById('entrada-aviso');
      if (aviso) {
        aviso.textContent = 'Este acceso está cerrado. Si crees que es un error, escribe al equipo.';
        aviso.hidden = false;
      }
      return;
    }
    estado.sesion = r.sesion;
    estado.motivo = null;
    sesionApi.guardar(almacen, r.sesion);
    navegar(permisos.ROLES_INTERNOS.indexOf(r.sesion.usuario.rol) !== -1 ? rutas.direccion('interno') : rutas.direccion('inicio'));
  }

  function accionSalir() {
    estado.sesion = null;
    sesionApi.guardar(almacen, null);
    navegar(rutas.direccion('entrada'));
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-accion]') : null;
    if (!el) return;
    var accion = el.getAttribute('data-accion');
    var valor = el.getAttribute('data-valor');

    if (accion === 'entrar') return accionEntrar();
    if (accion === 'salir') return accionSalir();

    if (accion === 'vista') {
      estado.vista = sesionApi.vistaValida(valor);
      sesionApi.escribir(almacen, sesionApi.CLAVE_VISTA, estado.vista);
      pintar({ cambioDeRuta: false });
      var otra = document.querySelector('[data-accion="vista"][data-valor="' + estado.vista + '"]');
      if (otra) otra.focus({ preventScroll: true });
      return;
    }

    if (accion === 'filtro') {
      var grupo = el.closest('.seg');
      if (grupo) {
        var botones = grupo.querySelectorAll('[data-accion="filtro"]');
        for (var i = 0; i < botones.length; i++) botones[i].setAttribute('aria-pressed', botones[i] === el ? 'true' : 'false');
      }
      return;
    }

    if (accion === 'sinconexion') {
      mostrarAviso(MENSAJES[valor] || 'Esto todavía no está conectado.');
    }
  });

  window.addEventListener('hashchange', function () { pintar({ cambioDeRuta: true }); });

  // Primera carga: sin dirección, pintar() redirige a la entrada o al inicio según haya sesión.
  pintar({ cambioDeRuta: true });
})();
