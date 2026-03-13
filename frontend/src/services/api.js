import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registrarUsuario = (datos) => api.post('/registro', datos);
export const loginUsuario = (datos) => api.post('/login', datos);

// Productos
export const getProductos = () => api.get('/productos');

// ADMIN PRODUCTOS
export const getAdminProductos = () => api.get('/admin/productos');

export const addProducto = (datos) => api.post('/productos', datos);

export const updateProducto = (id, datos) => api.put(`/productos/${id}`, datos);

export const deleteProducto = (id) => api.delete(`/productos/${id}`);

// NUEVA FUNCION ACTIVAR / DESACTIVAR
export const toggleProductoEstado = (id, activo) => {
  return api.patch(`/admin/productos/${id}/estado`, { activo });
};

// Pedidos
export const crearPedido = (datos) => api.post('/pedidos', datos);
export const getHistorialPedidos = () => api.get('/pedidos/historial');

export const getAdminPedidos = () => api.get('/admin/pedidos');

// Usuarios
export const getAdminUsuarios = () => api.get('/admin/usuarios');

export const updateUsuarioStatus = (id, datos) =>
  api.put(`/admin/usuarios/${id}`, datos);

// Perfil
export const getPerfil = () => api.get('/perfil');

// Estadisticas
export const getEstadisticas = () => api.get('/estadisticas');

// Auth helpers
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export const setUsuario = (usuario) => {
  if (usuario) localStorage.setItem('usuario', JSON.stringify(usuario));
  else localStorage.removeItem('usuario');
};

export const getUsuario = () => {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export default api;