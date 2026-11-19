/* De dónde saldrá cada dato de cada pantalla, y si existe hoy.
 * Es la ÚNICA lista: la leen los desplegables «¿De dónde saldrá esto?» del boceto y la comprobación
 * estática, que verifica que cada dato aparece también en PROPUESTA.md (para que no se desfasen).
 *
 * `existe`:  'si' = ya está en el panel · 'parcial' = existe pero no vale tal cual · 'no' = hay que construirlo.
 * `fuente`:  de dónde viene el dato (panel, Klaviyo, Drive).
 * Los ficheros citados son del panel (D:\VEXOR_PANEL_REPO\_CONTROL_CENTER\server\…). Las líneas
 * exactas están en PROPUESTA.md; aquí no se ponen números para que el boceto no lleve cifras.
 */
(function (raiz, fabrica) {
  'use strict';
  var api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.VX = raiz.VX || {};
    raiz.VX.fuentes = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ESTADOS = Object.freeze({
    si: { texto: 'Ya existe', tipo: 'ok' },
    parcial: { texto: 'Existe a medias', tipo: 'aviso' },
    no: { texto: 'Hay que construirlo', tipo: 'neutro' }
  });

  var FUENTES = Object.freeze({
    inicio: [
      { dato: 'Ventas del email en el mes', fuente: 'Klaviyo, guardado en el panel', existe: 'parcial', donde: 'api/klaviyo.js, tabla kpis', falta: 'Klaviyo solo está conectado en una parte de las tiendas, y las ventas llegan en la moneda de la tienda: hay que pasarlas a euros antes de enseñarlas.' },
      { dato: 'Porcentaje atribuido al email, aperturas y clics', fuente: 'Klaviyo, guardado en el panel', existe: 'parcial', donde: 'api/klaviyo.js, tabla kpis', falta: 'Lo mismo: conectar el resto de tiendas. Una vez al mes, no en directo.' },
      { dato: 'Siguiente envío', fuente: 'Panel', existe: 'parcial', donde: 'api/newsletters.js', falta: 'La tabla existe; hace falta que el equipo la mantenga al día y marcar qué se enseña al cliente.' },
      { dato: 'Piezas esperando tu visto bueno', fuente: 'Panel y Drive', existe: 'no', donde: 'api/reviews.js (solo revisión interna)', falta: 'No existe la aprobación del cliente: es una tabla nueva.' },
      { dato: 'Último informe', fuente: 'Panel', existe: 'parcial', donde: 'api/kpis.js, informe en PDF', falta: 'El PDF de hoy es interno: lleva cuotas y comisiones. Hace falta una versión para el cliente.' }
    ],
    calendario: [
      { dato: 'Fecha, asunto y estado de cada campaña', fuente: 'Panel', existe: 'parcial', donde: 'api/newsletters.js', falta: 'Existe con estados internos (borrador, programado, enviado). Hay que traducirlos al lenguaje del cliente y que alguien los mantenga.' },
      { dato: 'Automatizaciones activas', fuente: 'Panel', existe: 'parcial', donde: 'api/flows.js', falta: 'Existe el estado de cada flujo. Falta decidir cuáles se enseñan.' },
      { dato: 'Fechas comerciales del país', fuente: 'Panel', existe: 'si', donde: 'api/marketing-calendar.js', falta: 'Es un calendario general por país, no uno por cliente. Vale para enseñarlo tal cual.' }
    ],
    piezas: [
      { dato: 'Imagen de cada pieza', fuente: 'Drive', existe: 'parcial', donde: 'api/drive.js (ficheros y miniaturas)', falta: 'Hoy solo lo ve el equipo. Hay que dar acceso por cliente, sin abrir el Drive.' },
      { dato: 'Estado de la pieza', fuente: 'Panel', existe: 'parcial', donde: 'tabla design_reviews', falta: 'Hoy es la revisión interna del equipo, no la del cliente.' },
      { dato: 'Tu respuesta (aprobar o pedir cambios) y el comentario', fuente: 'Panel', existe: 'no', donde: 'no existe', falta: 'Tabla nueva. Guarda quién, cuándo y qué dijo. Depende de si se aprueba aquí o en Miro.' }
    ],
    resultados: [
      { dato: 'Ventas por origen (bienvenida, flujos, campañas)', fuente: 'Klaviyo, guardado en el panel', existe: 'parcial', donde: 'api/kpis.js, tabla kpis', falta: 'Los campos existen. Faltan tiendas sin conectar y la conversión a euros.' },
      { dato: 'Aperturas, clics y conversiones', fuente: 'Klaviyo, guardado en el panel', existe: 'parcial', donde: 'api/kpis.js, tabla kpis', falta: 'Igual que arriba.' },
      { dato: 'Importes en euros', fuente: 'Panel', existe: 'parcial', donde: 'lib/fx.js', falta: 'La conversión existe, pero no se aplica a lo que trae Klaviyo. Sin tasa, se enseña un guion, nunca una cifra dudosa.' },
      { dato: 'Informe mensual en PDF', fuente: 'Panel', existe: 'parcial', donde: 'api/kpis.js, informe en PDF', falta: 'Versión para el cliente, sin cuotas ni comisiones.' }
    ],
    facturas: [
      { dato: 'Lista de facturas: número, fecha, concepto, importe y estado', fuente: 'Panel', existe: 'parcial', donde: 'api/invoices.js', falta: 'Existe, pero hoy cualquier usuario con sesión puede pedirlas todas. Hace falta filtrar por el cliente de la sesión y ocultar borradores y anuladas.' },
      { dato: 'PDF de cada factura', fuente: 'Panel', existe: 'parcial', donde: 'api/invoices.js, descarga en PDF', falta: 'Hoy no comprueba de quién es la factura. Hay que comprobarlo antes de servirla.' }
    ],
    equipo: [
      { dato: 'Personas del equipo que llevan tu cuenta', fuente: 'Panel', existe: 'parcial', donde: 'campo owner_id en clients, newsletters y flows', falta: 'Hay una persona responsable por tienda, pero no se sabe si está al día ni distingue diseño de campañas. Hay que decidir qué persona se enseña y con qué nombre.' },
      { dato: 'Correo y horario de contacto de Vexor', fuente: 'Panel', existe: 'no', donde: 'no existe', falta: 'Lo tiene que dar la agencia. El correo que guarda la ficha es el del cliente, no el nuestro.' }
    ],
    ajustes: [
      { dato: 'Cambiar contraseña', fuente: 'Panel', existe: 'si', donde: 'middleware/auth.js', falta: 'Existe. Hoy pide ocho caracteres; para clientes, subir a doce como ya se hace al activar usuarios.' },
      { dato: 'Cerrar sesión', fuente: 'Panel', existe: 'si', donde: 'middleware/auth.js', falta: 'Existe. Falta «cerrar todas las sesiones».' },
      { dato: 'Últimos accesos a tu cuenta', fuente: 'Panel', existe: 'parcial', donde: 'tabla activity', falta: 'Se guarda cuándo entra cada usuario, pero no con qué aparato ni navegador. No se enseña el lugar: localizar la dirección de red es otro trabajo y otro tratamiento de datos.' },
      { dato: 'Recuperar contraseña por correo', fuente: 'Panel', existe: 'no', donde: 'no existe', falta: 'Hay que construirlo, y el panel no tiene todavía un servicio para enviar correos.' }
    ]
  });

  return Object.freeze({ ESTADOS: ESTADOS, FUENTES: FUENTES });
});
