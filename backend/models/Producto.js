const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    default: 0
  },
  categoria: {
    type: String,
    required: true,
    default: 'General'
  },
  categoria_id: {
    type: Number
  },
  original_id: {
    type: Number
  },
  imagen: {
    type: String,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  },
  ingredientes: [{
    type: String,
    trim: true
  }],
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Producto', ProductoSchema);
