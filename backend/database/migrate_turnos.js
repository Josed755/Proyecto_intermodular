const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Root.123',
        database: process.env.DB_NAME || 'cafes_db',
    });

    const connection = await pool.getConnection();

    try {
        console.log('Adding "turno" column to "usuarios" table...');
        await connection.execute('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turno VARCHAR(20) DEFAULT "mañana"');
        console.log('Migration successful: Column "turno" added.');
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

runMigration();
