import '../App.css';
import './EstiloSesiones.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { registrarUsuario } from '../services/api';

function Registrarse() {
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    
    // Validaciones
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const datosRegistro = {
        correo: formData.correo,
        nombre: formData.nombre,
        contrasena: formData.contrasena
      };

      await registrarUsuario(datosRegistro);
      
      setSuccess('Registro exitoso. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error en el registro');
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
        <div className="title">Registrarse</div>
      </header>
      <main className="App-main">
        <div className="cont_sesion">
          <form className='form-conte' onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" style={{color: 'red', marginBottom: '15px'}}>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" style={{color: 'green', marginBottom: '15px'}}>
                {success}
              </div>
            )}
            
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
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
            <div className="form-group">
              <label>Repetir Contraseña:</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
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
                {loading ? 'Registrando...' : 'Confirmar'}
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

export default Registrarse;