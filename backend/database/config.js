const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_URI no está definida en el archivo .env');
    }

    await mongoose.connect(dbUri);
    console.log('Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { dbConnection };