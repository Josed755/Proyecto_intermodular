const escpos = require('escpos');
escpos.Network = require('escpos-network');
require('dotenv').config();

const PRINTER_IP = process.env.PRINTER_IP || '192.168.100.10';
const PRINTER_PORT = 9100;

const imprimirTicket = async (pedido, usuario) => {
  return new Promise((resolve, reject) => {
    console.log(`[PRINTER] Iniciando proceso de impresión para el pedido de ${usuario?.nombre || 'Invitado'}`);
    console.log(`[PRINTER] Intentando conectar a la impresora en ${PRINTER_IP}:${PRINTER_PORT}...`);
    
    // Timeout de conexión para no dejar el proceso colgado
    const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
    const printer = new escpos.Printer(device);

    const timeout = setTimeout(() => {
      console.warn('[PRINTER] Tiempo de espera de conexión agotado. ¿Está la impresora en la misma red?');
      resolve(false);
    }, 5000);

    device.open((error) => {
      clearTimeout(timeout);
      if (error) {
        console.error('[PRINTER] Error de conexión física:', error.message);
        console.log('[PRINTER] Sugerencia: Verifica que el servidor y la impresora compartan la misma red local (WiFi).');
        return resolve(false);
      }

      try {
        console.log('[PRINTER] Conexión establecida. Generando buffer de ticket...');
        printer
          .font('a')
          .align('ct')
          .style('bu')
          .size(2, 2)
          .text('CafES App')
          .size(1, 1)
          .text('IES Jose Zerpa - Cafeteria')
          .text('--------------------------------')
          .align('lt')
          .style('normal')
          .text(`Fecha: ${new Date().toLocaleString()}`)
          .text(`Cliente: ${usuario?.nombre || 'Invitado'}`)
          .text(`Recoger en: ${pedido.centro || 'Cafeteria'}`)
          .text('--------------------------------')
          .style('b')
          .tableCustom([
            { text: "Cant", align: "LEFT", width: 0.1 },
            { text: "Producto", align: "LEFT", width: 0.6 },
            { text: "Precio", align: "RIGHT", width: 0.3 }
          ]);

        pedido.items.forEach(item => {
          printer.tableCustom([
            { text: `${item.cantidad}x`, align: "LEFT", width: 0.1 },
            { text: item.nombre, align: "LEFT", width: 0.6 },
            { text: `${(item.cantidad * item.precio).toFixed(2)}E`, align: "RIGHT", width: 0.3 }
          ]);
          
          if (item.ingredientesPersonalizados && item.ingredientesPersonalizados.length > 0) {
            printer.text(`  * Personalizado`);
          }
        });

        printer
          .text('--------------------------------')
          .align('rt')
          .size(1, 1)
          .text(`Subtotal: ${pedido.subtotal || (pedido.total / 1.07).toFixed(2)}E`)
          .text(`IGIC (7%): ${pedido.impuesto || (pedido.total - (pedido.total / 1.07)).toFixed(2)}E`)
          .size(2, 2)
          .text(`TOTAL: ${pedido.total.toFixed(2)}E`)
          .feed(2)
          .align('ct')
          .size(1, 1)
          .text('Gracias por su compra!')
          .text('Buen provecho!')
          .feed(3)
          .cut()
          .close();

        console.log('[PRINTER] Ticket enviado correctamente a la cola de impresión.');
        resolve(true);
      } catch (err) {
        console.error('[PRINTER] Error fatal durante la generación del ticket:', err);
        device.close();
        resolve(false);
      }
    });
  });
};

module.exports = { imprimirTicket };
