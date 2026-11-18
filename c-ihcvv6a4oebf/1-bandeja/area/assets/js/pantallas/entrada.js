/* Pantalla: Entrada. NO recoge nada: no hay correo ni contraseña. Solo un botón de boceto
 * y un selector de qué perfil de prueba se quiere ver. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(
    typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes,
    typeof module === 'object' && module.exports ? require('../sesion.js') : raiz.VX.sesion
  );
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c, sesion) {
  'use strict';

  function perfiles(elegido) {
    return Object.keys(sesion.PERFILES).map(function (id) {
      var p = sesion.PERFILES[id];
      return '<label class="radio"><input type="radio" name="perfil" value="' + c.esc(id) + '"' + (id === elegido ? ' checked' : '') + '>' +
        '<span class="radio-texto"><span class="radio-titulo">' + c.esc(p.etiqueta) + '</span>' +
        '<span class="radio-ayuda">' + c.esc(p.ayuda) + '</span></span></label>';
    }).join('');
  }

  function render(o) {
    var aviso = '';
    if (o.motivo === 'acceso-cerrado') {
      aviso = 'Este acceso está cerrado. Si crees que es un error, escribe al equipo.';
    }
    return '<div class="entrada">' +
      '<section class="entrada-texto" aria-labelledby="titulo-pagina">' +
      '<a class="entrada-logo" href="../" aria-label="Vexor Consulting, volver a la web">' +
      '<img src="assets/brand/vexor-logo.webp" width="520" height="179" alt="Vexor Consulting"></a>' +
      '<p class="eyebrow">Área de clientes</p>' +
      '<h1 id="titulo-pagina" class="pag-titulo pag-titulo-grande" tabindex="-1">Tus envíos y tus resultados, siempre a mano</h1>' +
      '<p class="lead">Aquí verás qué enviamos y cuándo, qué necesitamos que apruebes y qué ha vendido el email.</p>' +
      '<ul class="lista-iconos">' +
      '<li>' + c.icono('calendario') + '<span>Qué sale y cuándo</span></li>' +
      '<li>' + c.icono('piezas') + '<span>Qué esperamos de ti</span></li>' +
      '<li>' + c.icono('resultados') + '<span>Qué ha vendido el email, en euros</span></li>' +
      '</ul>' +
      '<p class="entrada-volver">' + c.boton({ tipo: 'texto', texto: 'Volver a la web', href: '../', icono: 'volver' }) + '</p>' +
      '</section>' +
      '<section class="entrada-panel" aria-labelledby="h-entrar"><div class="panel-doble"><div class="panel-doble-nucleo">' +
      '<h2 id="h-entrar" class="h-seccion">Entrar</h2>' +
      '<p class="muted">Esto es un boceto: no pide contraseña, no guarda nada y no está conectado a ninguna cuenta.</p>' +
      '<fieldset class="radios"><legend>Ver el boceto como</legend>' + perfiles(o.perfil || sesion.PERFIL_POR_DEFECTO) + '</fieldset>' +
      '<p id="entrada-aviso" class="aviso-error" role="alert"' + (aviso ? '' : ' hidden') + '>' + c.esc(aviso) + '</p>' +
      c.boton({ tipo: 'primario', texto: 'Entrar al boceto', accion: 'entrar', icono: 'flecha' }) +
      '<p class="entrada-nota">' + c.icono('candado') + '<span>En el área real entrarás con tu correo y tu contraseña, sobre una conexión segura.</span></p>' +
      '</div></div></section>' +
      '</div>';
  }

  return { id: 'entrada', render: render };
});
