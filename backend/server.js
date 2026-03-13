// backend/index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, testConnection } = require('./database/config');

// CONFIGURACIÓN INICIAL
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Log de peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Probar conexión a la DB
testConnection();

// MIDDLEWARE
const verificarAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_cafes');
    if (usuario.tipo !== 'admin') return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// RUTAS DE AUTENTICACIÓN

// Registro
app.post('/api/registro', async (req, res) => {
  const { correo, nombre, contrasena } = req.body;

  if (!correo || !nombre || !contrasena) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (contrasena.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  let connection;
  try {
    connection = await pool.getConnection();

    const [usuarioExistente] = await connection.execute('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (usuarioExistente.length > 0) return res.status(400).json({ error: 'El correo ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const [result] = await connection.execute(
      'INSERT INTO usuarios (correo, nombre, contrasena_hash) VALUES (?, ?, ?)',
      [correo, nombre, contrasenaHash]
    );

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', usuarioId: result.insertId });
  } catch (error) {
    console.error('Error registro:', error);
    res.status(500).json({ error: 'Error en el registro', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  try {
    const [usuarios] = await pool.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (usuarios.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = usuarios[0];
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre, tipo: usuario.tipo },
      process.env.JWT_SECRET || 'secret_key_cafes',
      { expiresIn: '24h' }
    );

    res.json({ success: true, message: 'Login exitoso', token, usuario: { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre, tipo: usuario.tipo } });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

// RUTAS DE PRODUCTOS

// Listar productos activos (frontend)
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p 
       LEFT JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.activo = TRUE 
       ORDER BY p.nombre`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS ADMIN PRODUCTOS

// Listar todos los productos (incluyendo desactivados)
app.get('/api/admin/productos', verificarAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p 
       LEFT JOIN categorias c ON p.categoria_id = c.id 
       ORDER BY p.activo DESC, p.nombre ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar / Desactivar producto
app.patch('/api/admin/productos/:id/estado', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    await pool.execute('UPDATE productos SET activo = ? WHERE id = ?', [activo, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
app.post('/api/admin/productos', verificarAdmin, async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, categoria_id } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria_id, activo) VALUES (?, ?, ?, ?, ?, TRUE)',
      [nombre, descripcion, precio, imagen_url, categoria_id]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modificar producto
app.put('/api/admin/productos/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, imagen_url, categoria_id, activo } = req.body;
  try {
    await pool.execute(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, categoria_id = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, precio, imagen_url, categoria_id, activo, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar (desactivar) producto
app.delete('/api/admin/productos/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS ADMIN PEDIDOS
app.get('/api/admin/pedidos', verificarAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, u.nombre as usuario_nombre 
      FROM pedidos p 
      JOIN usuarios u ON p.usuario_id = u.id 
      ORDER BY p.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS ADMIN USUARIOS
app.get('/api/admin/usuarios', verificarAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, correo, nombre, tipo, activo, fecha_registro FROM usuarios ORDER BY fecha_registro DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/usuarios/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { tipo, activo } = req.body;
  try {
    await pool.execute('UPDATE usuarios SET tipo = ?, activo = ? WHERE id = ?', [tipo, activo, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HEALTH CHECK Y TEST
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT 1 as test');
    const dbStatus = result ? 'CONNECTED' : 'DISCONNECTED';
    const [tables] = await pool.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', [process.env.DB_NAME || 'cafes_db']);
    res.json({ status: 'OK', message: 'Backend funcionando', timestamp: new Date().toISOString(), database: dbStatus, table_count: tables[0].count });
  } catch (error) {
    res.json({ status: 'ERROR', message: 'Problema DB', error: error.message });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando', timestamp: new Date() });
});

// INICIO DEL SERVIDOR
app.listen(PORT, () => {
  console.log(`Backend ejecutándose en http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Registro: POST http://localhost:${PORT}/api/registro`);
  console.log(`Login: POST http://localhost:${PORT}/api/login`);
  console.log(`Productos frontend: GET http://localhost:${PORT}/api/productos`);
  console.log(`Productos admin: GET http://localhost:${PORT}/api/admin/productos`);
});