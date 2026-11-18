/* Pantalla: Ajustes. No lleva ningún campo de contraseña: es un boceto y no recoge nada. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function render(o) {
    var accesos = c.tabla({
      vista: o.vista,
      caption: 'Últimos accesos a tu cuenta',
      columnas: [
        { clave: 'fecha', titulo: 'Fecha' },
        { clave: 'dispositivo', titulo: 'Dispositivo' }
      ],
      filas: 3,
      vacioDe: {
        icono: 'escudo',
        titulo: 'Aún no hay accesos que enseñar',
        texto: 'Aquí verás cuándo y con qué aparato se ha entrado a tu cuenta, para que detectes cualquier cosa rara.'
      }
    });

    return c.cabecera({
      eyebrow: 'Tu cuenta',
      titulo: 'Ajustes',
      lead: 'Tu contraseña, tus sesiones y quién ha entrado.',
      vista: o.vista
    }) +
      '<section class="seccion fila-ajuste" aria-labelledby="h-cuenta">' +
      '<div class="fila-ajuste-texto"><h2 id="h-cuenta" class="h-seccion">Tu cuenta</h2><p class="muted">Los datos con los que entras.</p></div>' +
      '<dl class="datos-lista fila-ajuste-cuerpo">' +
      '<div><dt>Nombre</dt><dd>' + c.dash() + '</dd></div>' +
      '<div><dt>Correo</dt><dd>' + c.dash() + '</dd></div>' +
      '<div><dt>Tienda</dt><dd><span class="dato-vacio">Tu tienda</span></dd></div></dl></section>' +

      '<section class="seccion fila-ajuste" aria-labelledby="h-pass">' +
      '<div class="fila-ajuste-texto"><h2 id="h-pass" class="h-seccion">Contraseña</h2>' +
      '<p class="muted">Mínimo doce caracteres. Te pediremos la actual antes de cambiarla, y cerraremos tus otras sesiones.</p></div>' +
      '<div class="fila-ajuste-cuerpo">' +
      c.boton({ tipo: 'secundario', texto: 'Cambiar contraseña', accion: 'sinconexion', valor: 'password', icono: 'candado' }) +
      '</div></section>' +

      '<section class="seccion fila-ajuste" aria-labelledby="h-ses">' +
      '<div class="fila-ajuste-texto"><h2 id="h-ses" class="h-seccion">Sesiones</h2>' +
      '<p class="muted">Cierra esta sesión, o todas las que tengas abiertas en otros aparatos.</p></div>' +
      '<div class="fila-ajuste-cuerpo fila-botones">' +
      c.boton({ tipo: 'secundario', texto: 'Cerrar sesión', accion: 'salir', icono: 'salir' }) +
      c.boton({ tipo: 'secundario', texto: 'Cerrar todas las sesiones', accion: 'sinconexion', valor: 'todas' }) +
      '</div></section>' +

      '<section class="seccion" aria-labelledby="h-accesos"><h2 id="h-accesos" class="h-seccion">Últimos accesos</h2>' + accesos + '</section>' +

      '<section class="seccion fila-ajuste" aria-labelledby="h-legal">' +
      '<div class="fila-ajuste-texto"><h2 id="h-legal" class="h-seccion">Legal</h2>' +
      '<p class="muted">El área de clientes necesita su propio aviso y su propia política de privacidad. Aquí enlazan los de la web mientras se redactan.</p></div>' +
      '<div class="fila-ajuste-cuerpo fila-botones">' +
      c.boton({ tipo: 'texto', texto: 'Aviso legal', href: '../landing_sencilla/aviso-legal/index.html', icono: 'flecha' }) +
      c.boton({ tipo: 'texto', texto: 'Privacidad', href: '../landing_sencilla/privacidad/index.html', icono: 'flecha' }) +
      '</div></section>' +
      c.desplegableFuentes('ajustes');
  }

  return { id: 'ajustes', render: render };
});
