const mongoose = require('mongoose');

const IngredienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  original_id: {
    type: Number
  }
});

module.exports = mongoose.model('Ingrediente', IngredienteSchema);
