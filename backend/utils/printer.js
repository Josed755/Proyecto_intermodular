const escpos = require('escpos');
escpos.Network = require('escpos-network');
require('dotenv').config();

const PRINTER_IP = process.env.PRINTER_IP || '192.168.100.10';
const PRINTER_PORT = 9100;

const imprimirTicket = async (pedido, usuario) => {
  return new Promise((resolve, reject) => {
    console.log(`Intentando imprimir en ${PRINTER_IP}...`);
    
    const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
    const printer = new escpos.Printer(device);

    device.open((error) => {
      if (error) {
        console.error('Error al conectar con la impresora:', error);
        return resolve(false); // No bloqueamos el flujo si no hay impresora
      }

      try {
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

        console.log('Ticket enviado a la impresora.');
        resolve(true);
      } catch (err) {
        console.error('Error al generar el ticket:', err);
        device.close();
        resolve(false);
      }
    });
  });
};

module.exports = { imprimirTicket };
