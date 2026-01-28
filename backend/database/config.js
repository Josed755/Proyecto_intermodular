const mysql = require('mysql2/promise');
require('dotenv').config();

// Esto es lo que tube que instalar: npm install express cors mysql2 dotenv
// Para comprobar que el backend funciona http://localhost:5000/api/health

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8414',
  database: process.env.DB_NAME || 'cafes_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Crea la tabla Alumnos si no existe
const createTable = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Alumnos (
        Id INT PRIMARY KEY AUTO_INCREMENT,
        Matricula VARCHAR(20) UNIQUE NOT NULL,
        Nombre VARCHAR(100) NOT NULL,
        Sexo ENUM('Masculino', 'Femenino') NOT NULL,
        Edad INT,
        Email VARCHAR(100),
        Repetidor BOOLEAN DEFAULT FALSE,
        Activo BOOLEAN DEFAULT TRUE,
        FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tabla Alumnos creada/verificada');
    connection.release();
  } catch (error) {
    console.error('Error creando tabla:', error.message);
  }
};

module.exports = { pool, createTable };