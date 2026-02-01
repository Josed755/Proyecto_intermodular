const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8414',
  database: process.env.DB_NAME || 'cafes_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL establecida correctamente');
    
    // Verifica que las tablas existen
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tablas en la base de datos:', tables.map(t => Object.values(t)[0]));
    
    connection.release();
  } catch (error) {
    console.error('Error conectando a MySQL:', error.message);
    console.log('   Por favor crea manualmente la base de datos:');
    console.log('   1. Abre MySQL (phpMyAdmin, Workbench, o línea de comandos)');
    console.log('   2. Ejecuta el script SQL proporcionado');
    console.log('   3. Verifica que las tablas se crearon correctamente');
  }
};

module.exports = { pool, testConnection };