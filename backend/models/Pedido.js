const mongoose = require('mongoose');

const DetallePedidoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombre_producto: String, // Desnormalizado para historial
  cantidad: {
    type: Number,
    required: true,
    default: 1
  },
  precio_unitario: {
    type: Number,
    required: true
  },
  ingredientesPersonalizados: [String]
});

const PedidoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [DetallePedidoSchema],
  total: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  centro: {
    type: String,
    default: 'IES José Zerpa'
  },
  metodo_pago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'online'],
    default: 'efectivo'
  },
  estado: {
    type: String,
    enum: ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'],
    default: 'pendiente'
  }
});

module.exports = mongoose.model('Pedido', PedidoSchema);
