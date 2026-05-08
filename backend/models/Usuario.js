const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  contrasena_hash: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['admin', 'empleado', 'cliente'],
    default: 'cliente'
  },
  centro: {
    type: String,
    default: 'IES José Zerpa'
  },
  activo: {
    type: Boolean,
    default: true
  },
  turno: {
    type: String,
    enum: ['mañana', 'tarde', 'noche'],
    default: 'mañana'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
