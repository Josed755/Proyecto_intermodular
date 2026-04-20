const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '8414',
        database: process.env.DB_NAME || 'cafes_db',
    });

    try {
        const connection = await pool.getConnection();
        console.log('Migrando tablas...');

        // 1. Agregar columna 'centro' a usuarios
        try {
            await connection.execute('ALTER TABLE usuarios ADD COLUMN centro VARCHAR(100) DEFAULT "IES José Zerpa"');
            console.log('Columna "centro" añadida a la tabla "usuarios"');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAMES') {
                console.log('La columna "centro" ya existe en "usuarios"');
            } else {
                throw e;
            }
        }

        // 2. Agregar columna 'centro' a pedidos
        try {
            await connection.execute('ALTER TABLE pedidos ADD COLUMN centro VARCHAR(100)');
            console.log('Columna "centro" añadida a la tabla "pedidos"');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAMES') {
                console.log('La columna "centro" ya existe en "pedidos"');
            } else {
                throw e;
            }
        }

        connection.release();
        console.log('Migración completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error.message);
        process.exit(1);
    }
}

migrate();
