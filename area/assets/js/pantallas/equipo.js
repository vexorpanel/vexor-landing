/* Pantalla: Tu equipo y contacto. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function persona(rol) {
    return '<li class="persona"><span class="persona-avatar" aria-hidden="true">' + c.icono('equipo') + '</span>' +
      '<span class="persona-datos"><span class="persona-nombre">' + c.dash() + '</span>' +
      '<span class="persona-rol">' + c.esc(rol) + '</span></span></li>';
  }

  function render(o) {
    var estructura = o.vista !== 'vacio';

    var personas = estructura
      ? '<ul class="personas" aria-labelledby="h-quien">' +
        persona('Responsable de tu cuenta') + persona('Diseño de tus emails') + persona('Campañas') + '</ul>'
      : c.vacio({ icono: 'equipo', titulo: 'Aún no hay nadie asignado', texto: 'Cuando haya un equipo asignado a tu tienda, verás aquí quién es cada persona y qué lleva.' });

    var contacto = estructura
      ? '<dl class="datos-lista">' +
        '<div><dt>Correo</dt><dd>' + c.dash() + '</dd></div>' +
        '<div><dt>Teléfono o mensajes</dt><dd>' + c.dash() + '</dd></div>' +
        '<div><dt>Horario</dt><dd>' + c.dash() + '</dd></div></dl>' +
        '<p class="bloque-pie">' + c.boton({ tipo: 'primario', texto: 'Escribir al equipo', accion: 'sinconexion', valor: 'escribir', icono: 'mensaje' }) + '</p>'
      : c.vacio({ mini: true, icono: 'mensaje', titulo: 'Sin datos de contacto', texto: 'Aquí aparecerá cómo hablar con nosotros.' });

    return c.cabecera({
      eyebrow: 'Quién lleva tu tienda',
      titulo: 'Tu equipo y contacto',
      lead: 'Las personas que trabajan en tus envíos y cómo hablar con ellas.',
      vista: o.vista
    }) +
      '<div class="dos-col">' +
      '<section class="col-principal" aria-labelledby="h-quien"><h2 id="h-quien" class="h-seccion">Quién lleva tu cuenta</h2>' + personas + '</section>' +
      '<section class="col-lateral" aria-labelledby="h-contacto"><h2 id="h-contacto" class="h-seccion">Contacto</h2>' + contacto + '</section>' +
      '</div>' +
      c.desplegableFuentes('equipo');
  }

  return { id: 'equipo', render: render };
});
