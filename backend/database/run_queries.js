const mysql = require('mysql2/promise');
require('dotenv').config();

async function runQueries() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '8414',
        database: process.env.DB_NAME || 'cafes_db',
    });

    const connection = await pool.getConnection();

    try {
        console.log('Query 1: Adding centro to usuarios');
        await connection.execute('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS centro VARCHAR(100) DEFAULT "IES José Zerpa"');
        console.log('Success 1');
    } catch (e) { console.log('Error 1:', e.message); }

    try {
        console.log('Query 2: Adding centro to pedidos');
        await connection.execute('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS centro VARCHAR(100)');
        console.log('Success 2');
    } catch (e) { console.log('Error 2:', e.message); }

    connection.release();
    process.exit(0);
}

runQueries();
