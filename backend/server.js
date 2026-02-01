const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, testConnection } = require('./database/config');

// Crea la app de Express y usa el puerto 5000 por defecto
const app = express();
const PORT = process.env.PORT || 5000;

// Permite peticiones desde React
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Esto imprime en consola cada petición
// Para ver qué está llegando al backend por si hay problemas
app.use((req, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Probar conexión a la base de datos
testConnection();

// Recibe el correo nombre y contraseña
app.post('/api/registro', async (req, res) => {
  console.log('Registro recibido:', req.body);
  
  const { correo, nombre, contrasena } = req.body;
  
  // Validación básica
  if (!correo || !nombre || !contrasena) {
    console.log('Datos incompletos');
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (contrasena.length < 8) {
    console.log('Contraseña muy corta');
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Conexión a DB obtenida');

    // Verificar si el correo ya existe
    console.log('Verificando si correo existe:', correo);
    const [usuarioExistente] = await connection.execute(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    
    console.log('Resultado verificación:', usuarioExistente);
    
    if (usuarioExistente.length > 0) {
      console.log('Correo ya registrado');
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hash de la contraseña (Cifra la contraseña)
    // Se guarda el hash, no la contraseña real por proteccion
    console.log('Generando hash de contraseña...');
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);
    console.log('Hash generado');

    // Inserta el usuario
    console.log('Insertando usuario en DB...');
    const [result] = await connection.execute(
      'INSERT INTO usuarios (correo, nombre, contrasena_hash) VALUES (?, ?, ?)',
      [correo, nombre, contrasenaHash]
    );

    console.log('Usuario insertado, ID:', result.insertId);

    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      usuarioId: result.insertId 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error sqlMessage:', error.sqlMessage);
    
    let errorMessage = 'Error en el registro';
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'El correo ya está registrado';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Error de base de datos: tabla no encontrada';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
      console.log('Conexión liberada');
    }
  }
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
  console.log('Login recibido:', { correo: req.body.correo });
  
  const { correo, contrasena } = req.body;
  
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  try {
    console.log('Buscando usuario:', correo);
    const [usuarios] = await pool.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    
    console.log('Usuarios encontrados:', usuarios.length);
    
    if (usuarios.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];
    console.log('Usuario encontrado:', usuario.nombre);

    // Verificar contraseña
    console.log('Verificando contraseña...');
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    console.log('Resultado verificación:', contrasenaValida);
    
    if (!contrasenaValida) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Genera un token JWT, identifica al usuario y dura 24 horas se usa para proteger rutas privadas
    console.log('Generando token...');
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo: usuario.correo,
        nombre: usuario.nombre,
        tipo: usuario.tipo 
      },
      process.env.JWT_SECRET || 'secret_key_cafes',
      { expiresIn: '24h' }
    );

    console.log('Login exitoso para:', usuario.nombre);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// RUTAS DE PRODUCTOS
app.get('/api/productos', async (req, res) => {
  console.log('Solicitando productos...');
  /*Devuelve los productos activos y
  incluye el nombre de la categoría
  ordenados alfabéticamente */
  // Esto es lo que usa el frontend para mostrar el catálogo.
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p 
       LEFT JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.activo = TRUE 
       ORDER BY p.nombre`
    );
    console.log(`Productos encontrados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('Error GET /api/productos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check para comprobar que todo funciona
app.get('/api/health', async (res) => {
  try {
    // Verificar conexión a DB
    const [result] = await pool.execute('SELECT 1 as test');
    const dbStatus = result ? 'CONNECTED' : 'DISCONNECTED';
    
    // Contar tablas
    const [tables] = await pool.execute(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?',
      [process.env.DB_NAME || 'cafes_db']
    );
    
    res.json({ 
      status: 'OK', 
      message: 'Backend de CafES App funcionando',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      table_count: tables[0].count
    });
  } catch (error) {
    res.json({ 
      status: 'ERROR', 
      message: 'Problema con la base de datos',
      error: error.message 
    });
  }
});

// Para comporbar que el servidor responde
app.get('/api/test', (res) => {
  res.json({ message: 'API funcionando', timestamp: new Date() });
});

//Inicia el backend y muestra todas las rutas importantes por consola
app.listen(PORT, () => {
  console.log(`Backend ejecutándose en: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Registro: POST http://localhost:${PORT}/api/registro`);
  console.log(`Login: POST http://localhost:${PORT}/api/login`);
  console.log(`Productos: GET http://localhost:${PORT}/api/productos`);
});