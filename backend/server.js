// backend/index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { dbConnection } = require('./database/config');
const Usuario = require('./models/Usuario');
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');
const Ingrediente = require('./models/Ingrediente');
const { imprimirTicket } = require('./utils/printer');

// CONFIGURACIÓN INICIAL
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Permitir todos los orígenes en producción
app.use(express.json());

// Log de peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Probar conexión a la DB
dbConnection();

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
  const { correo, nombre, contrasena, centro } = req.body;

  if (!correo || !nombre || !contrasena) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (contrasena.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  try {
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) return res.status(400).json({ error: 'El correo ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = new Usuario({
      correo,
      nombre,
      contrasena_hash: contrasenaHash,
      centro: centro || 'IES José Zerpa'
    });

    await nuevoUsuario.save();

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', usuarioId: nuevoUsuario._id });
  } catch (error) {
    console.error('Error registro:', error);
    res.status(500).json({ error: 'Error en el registro', details: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario._id, correo: usuario.correo, nombre: usuario.nombre, tipo: usuario.tipo },
      process.env.JWT_SECRET || 'secret_key_cafes',
      { expiresIn: '24h' }
    );
    res.json({ success: true, message: 'Login exitoso', token, usuario: { id: usuario._id, correo: usuario.correo, nombre: usuario.nombre, tipo: usuario.tipo } });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

// RUTAS DE PRODUCTOS

// Listar productos activos (frontend)
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true }).sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos los ingredientes
app.get('/api/ingredientes', async (req, res) => {
  try {
    const ingredientes = await Ingrediente.find({ activo: true }).sort({ nombre: 1 });
    const result = ingredientes.map(ing => ({
      id: ing.original_id || ing._id,
      nombre: ing.nombre,
      activo: ing.activo
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar ingredientes de un producto específico
app.get('/api/productos/:id/ingredientes', async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Buscamos los objetos de ingredientes por nombre
    const ingredientesObj = await Ingrediente.find({ nombre: { $in: producto.ingredientes } });
    
    // Mapeamos para que el frontend vea 'id' en lugar de '_id' u 'original_id'
    const result = ingredientesObj.map(ing => ({
      id: ing.original_id || ing._id,
      nombre: ing.nombre,
      activo: ing.activo
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS ADMIN PRODUCTOS

// Listar todos los productos (incluyendo desactivados)
app.get('/api/admin/productos', verificarAdmin, async (req, res) => {
  try {
    const productos = await Producto.find().sort({ activo: -1, nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar / Desactivar producto
app.patch('/api/admin/productos/:id/estado', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    await Producto.findByIdAndUpdate(id, { activo });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
app.post('/api/admin/productos', verificarAdmin, async (req, res) => {
  const { nombre, descripcion, precio, categoria, categoria_id, imagen } = req.body;
  try {
    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      categoria: categoria || 'General',
      categoria_id: categoria_id || 1,
      imagen: imagen || '',
      activo: true
    });
    await nuevoProducto.save();
    res.status(201).json({ success: true, id: nuevoProducto._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modificar producto
app.put('/api/admin/productos/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria, categoria_id, imagen, activo } = req.body;
  try {
    await Producto.findByIdAndUpdate(id, {
      nombre,
      descripcion,
      precio,
      categoria,
      categoria_id,
      imagen,
      activo
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar (desactivar) producto
app.delete('/api/admin/productos/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await Producto.findByIdAndUpdate(id, { activo: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE PEDIDOS

// Crear nuevo pedido
app.post('/api/pedidos', async (req, res) => {
  const { usuario_id, total, items, metodo_pago, centro } = req.body;

  if (!usuario_id || !total || !items || !items.length) {
    return res.status(400).json({ error: 'Datos de pedido incompletos' });
  }

  try {
    const nuevoPedido = new Pedido({
      usuario: usuario_id,
      total,
      centro: centro || 'IES José Zerpa',
      metodo_pago: metodo_pago || 'efectivo',
      estado: 'pendiente',
      items: items.map(item => ({
        producto: item.id,
        nombre_producto: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        ingredientesPersonalizados: item.ingredientesPersonalizados || []
      }))
    });

    await nuevoPedido.save();
    
    // Intentar imprimir el ticket en segundo plano (para no retrasar la respuesta)
    try {
      const usuario = await Usuario.findById(usuario_id);
      imprimirTicket({ items, total, centro, subtotal: req.body.subtotal, impuesto: req.body.impuesto }, usuario)
        .catch(err => console.error('Error al imprimir ticket:', err));
    } catch (err) {
      console.error('Error al obtener usuario para imprimir:', err);
    }

    res.status(201).json({ success: true, message: 'Pedido creado exitosamente', pedidoId: nuevoPedido._id });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al procesar el pedido', details: error.message });
  }
});

// Obtener historial de pedidos del usuario
app.get('/api/pedidos/historial', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_cafes');
    const pedidos = await Pedido.find({ usuario: decoded.id }).sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS ADMIN PEDIDOS
app.get('/api/admin/pedidos', verificarAdmin, async (req, res) => {
  const { centro } = req.query;
  try {
    let query = {};
    if (centro) {
      query.centro = centro;
    }

    const pedidos = await Pedido.find(query)
      .populate('usuario', 'nombre correo')
      .sort({ fecha: -1 });

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA PERFIL USUARIO
app.put('/api/usuarios/:id/perfil', async (req, res) => {
  const { id } = req.params;
  const { nombre, centro } = req.body;

  if (!nombre || !centro) return res.status(400).json({ error: 'Nombre y centro son requeridos' });

  try {
    await Usuario.findByIdAndUpdate(id, { nombre, centro });
    res.json({ success: true, message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS ADMIN USUARIOS
app.get('/api/admin/usuarios', verificarAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find({ tipo: { $in: ['admin', 'empleado'] } })
      .select('-contrasena_hash')
      .sort({ fecha_registro: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/usuarios/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { tipo, activo, turno } = req.body;
  try {
    await Usuario.findByIdAndUpdate(id, { tipo, activo, turno });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/usuarios', verificarAdmin, async (req, res) => {
  const { correo, nombre, contrasena, tipo, turno } = req.body;
  if (!correo || !nombre || !contrasena || !tipo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = new Usuario({
      correo,
      nombre,
      contrasena_hash: contrasenaHash,
      tipo,
      activo: true,
      turno: turno || 'mañana'
    });

    await nuevoUsuario.save();
    res.status(201).json({ success: true, id: nuevoUsuario._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HEALTH CHECK Y TEST
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    const userCount = await Usuario.countDocuments();
    const productCount = await Producto.countDocuments();

    res.json({
      status: 'OK',
      message: 'Backend funcionando',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      counts: {
        usuarios: userCount,
        productos: productCount
      }
    });
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