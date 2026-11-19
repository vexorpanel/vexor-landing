/* Pantalla: aviso para el equipo de Vexor. El equipo sigue trabajando en el panel de siempre. */
(function (raiz, fabrica) {
  'use strict';
  var m = fabrica(typeof module === 'object' && module.exports ? require('../componentes.js') : raiz.VX.componentes);
  if (typeof module === 'object' && module.exports) { module.exports = m; }
  else { raiz.VX = raiz.VX || {}; raiz.VX.pantallas = raiz.VX.pantallas || {}; raiz.VX.pantallas[m.id] = m; }
})(typeof self !== 'undefined' ? self : this, function (c) {
  'use strict';

  function render() {
    return '<div class="interno">' +
      c.cabecera({ eyebrow: 'Equipo de Vexor', titulo: 'Tú entras por el panel de siempre', lead: 'El área de clientes es solo para las tiendas. Tu acceso al panel no cambia.' }) +
      '<section class="seccion" aria-labelledby="h-interno"><h2 id="h-interno" class="h-seccion">Qué cambia y qué no</h2>' +
      '<ul class="lista-checks">' +
      '<li>' + c.icono('visto') + '<span>Sigues viendo y haciendo lo mismo que hoy en el panel.</span></li>' +
      '<li>' + c.icono('visto') + '<span>Las tiendas solo ven lo suyo, nunca lo de otra tienda.</span></li>' +
      '<li>' + c.icono('visto') + '<span>Ver el área como una tienda lo vería es una decisión pendiente.</span></li>' +
      '</ul>' +
      '<p class="bloque-pie">' + c.boton({ tipo: 'secundario', texto: 'Cambiar de perfil', accion: 'salir', icono: 'salir' }) + '</p>' +
      '</section></div>';
  }

  return { id: 'interno', render: render };
});
