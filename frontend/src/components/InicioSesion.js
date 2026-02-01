import '../App.css';
import './EstiloSesiones.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUsuario, setAuthToken, setUsuario } from '../services/api';

function InicioSesion() {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUsuario(formData);
      
      // Guarda el token y datos del usuario
      setAuthToken(response.data.token);
      setUsuario(response.data.usuario);

      // Redirige a la página principal
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.error || 'Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="title">Inicio de Sesión</div>
      </header>
      <main className="App-main">
        <div className="cont_sesion">
          <form className='form-cont' onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" style={{color: 'red', marginBottom: '15px'}}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label>Correo:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>
            <div className="btn-container">
              <button 
                type="button" 
                className="btn-volver" 
                onClick={handleVolver}
                disabled={loading}
              >
                Volver
              </button>
              <button 
                type="submit" 
                className="btn-confirmar" 
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <footer className="App-footer">
        <div>© IES José Zerpa - etc...</div>
      </footer>
    </div>
  );
}

export default InicioSesion;