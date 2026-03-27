const { pool } = require('./config');

async function setup() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('--- Final Clean Sync: Ingredients from Products ---');

        // 1. Drop and recreate for absolute consistency and constraints
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('DROP TABLE IF EXISTS producto_ingredientes');
        await connection.execute('DROP TABLE IF EXISTS ingredientes');

        await connection.execute(`
      CREATE TABLE ingredientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10, 2) DEFAULT 0.00,
        activo BOOLEAN DEFAULT TRUE,
        UNIQUE KEY unique_nombre (nombre)
      )
    `);

        await connection.execute(`
      CREATE TABLE producto_ingredientes (
        producto_id INT,
        ingrediente_id INT,
        PRIMARY KEY (producto_id, ingrediente_id),
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE CASCADE
      )
    `);
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Clean infrastructure ready.');

        // 2. Fetch all products
        const [productos] = await connection.execute('SELECT id, nombre, ingredientes FROM productos');

        for (const prod of productos) {
            if (!prod.ingredientes) continue;

            // CLEANING: Remove parentheses, split, trim, capitalize
            let cleanText = prod.ingredientes.replace(/\([^)]*\)/g, '');
            const rawParts = cleanText.split(/[;,]/);

            for (let part of rawParts) {
                let name = part.trim().replace(/[().]/g, '');
                if (name.length < 3 || name.match(/^E-\d+$/)) continue;
                name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

                // 3. Insert and Link (UNIQUE constraint handles duplicates)
                try {
                    await connection.execute('INSERT IGNORE INTO ingredientes (nombre, precio) VALUES (?, ?)', [name, 0.00]);
                    const [rows] = await connection.execute('SELECT id FROM ingredientes WHERE nombre = ?', [name]);
                    const ingId = rows[0].id;
                    await connection.execute('INSERT IGNORE INTO producto_ingredientes (producto_id, ingrediente_id) VALUES (?, ?)', [prod.id, ingId]);
                } catch (err) {
                    console.error(`Failed to process ingredient "${name}":`, err.message);
                }
            }
        }

        console.log('--- Dynamic Ingredients Setup Complete (No Duplicates) ---');
    } catch (error) {
        console.error('Critical failure in ingredient setup:', error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

setup();
