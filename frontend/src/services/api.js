import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a las peticiones
/*Se ejecuta antes de enviar cada petición, 
busca el token JWT en localStorage y
si existe, lo agrega automáticamente a los headers */
// Para que no tengas que agregar manualmente el token en cada petición
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

// Interceptor para manejar errores de autenticación
/*Si el servidor responde con error 401 (No autorizado):
  -Borra el token expirado/inválido
  -Borra los datos del usuario
  -Redirige automáticamente al login */
// Esto evita que el usuario se quede "atascado" con un token inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Registro y login
export const registrarUsuario = (datos) => api.post('/registro', datos);
export const loginUsuario = (datos) => api.post('/login', datos);

// Productos
export const getProductos = () => api.get('/productos');

// Pedidos
export const crearPedido = (datos) => api.post('/pedidos', datos);
export const getHistorialPedidos = () => api.get('/pedidos/historial');

// Perfil
export const getPerfil = () => api.get('/perfil');

// Estadisticas (solo admin)
export const getEstadisticas = () => api.get('/estadisticas');

// Tokens
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Para guardar el usuario
export const setUsuario = (usuario) => {
  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  } else {
    localStorage.removeItem('usuario');
  }
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