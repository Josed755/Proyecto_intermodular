import '../App.css';
import './EstiloSesiones.css';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
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
  const menuRef = useRef(null);

  const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalActivo, setModalActivo] = useState(null);

  const textos = {
    es: {
      titulo: 'Registrarse',
      nombre: 'Nombre:',
      correo: 'Correo:',
      contrasena: 'Contraseña:',
      repetirContrasena: 'Repetir Contraseña:',
      volver: 'Volver',
      confirmar: 'Confirmar',
      registrando: 'Registrando...',
      exito: 'Registro exitoso. Redirigiendo al login...',
      errorCoincidencia: 'Las contraseñas no coinciden',
      errorLongitud: 'La contraseña debe tener al menos 8 caracteres',
      idioma: 'Idioma',
      ayuda: 'Ayuda',
      acerca: 'Acerca de',
      cerrar: 'Cerrar',
      espanyol: 'Español',
      ingles: 'Inglés',
      ayudaContenido: 'Crea una cuenta para realizar tus pedidos en la cafetería. Necesitarás un correo válido y una contraseña con al menos 8 caracteres.',
      acercaContenido: 'CaffES App v1.0 - IES José Zerpa'
    },
    en: {
      titulo: 'Register',
      nombre: 'Name:',
      correo: 'Email:',
      contrasena: 'Password:',
      repetirContrasena: 'Confirm Password:',
      volver: 'Back',
      confirmar: 'Confirm',
      registrando: 'Registering...',
      exito: 'Registration successful. Redirecting to login...',
      errorCoincidencia: 'Passwords do not match',
      errorLongitud: 'Password must be at least 8 characters long',
      idioma: 'Language',
      ayuda: 'Help',
      acerca: 'About',
      cerrar: 'Close',
      espanyol: 'Spanish',
      ingles: 'English',
      ayudaContenido: 'Create an account to place your orders at the cafeteria. You will need a valid email and a password with at least 8 characters.',
      acercaContenido: 'CaffES App v1.0 - IES José Zerpa'
    }
  };

  const t = textos[idioma];

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

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError(t.errorCoincidencia);
      return;
    }

    if (formData.contrasena.length < 6) {
      setError(t.errorLongitud);
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

      setSuccess(t.exito);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  useEffect(() => {
    localStorage.setItem('idioma', idioma);
  }, [idioma]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <div className="title">{t.titulo}</div>
          <div className="header-right">
            <div className="user-menu-wrapper" ref={menuRef}>
              <button className="hamburger-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
                <span></span>
                <span></span>
                <span></span>
              </button>
              {menuAbierto && (
                <div className="user-dropdown session-dropdown shadow-lg">
                  <button className="dropdown-item" onClick={() => { setModalActivo('idioma'); setMenuAbierto(false); }}>
                    {t.idioma}
                  </button>
                  <button className="dropdown-item" onClick={() => { setModalActivo('ayuda'); setMenuAbierto(false); }}>
                    {t.ayuda}
                  </button>
                  <button className="dropdown-item" onClick={() => { setModalActivo('acerca'); setMenuAbierto(false); }}>
                    {t.acerca}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {modalActivo && (
        <div className="prefs-overlay">
          <div className="prefs-modal shadow-lg">
            <h3>{t[modalActivo]}</h3>
            <div className="modal-content-area">
              {modalActivo === 'idioma' && (
                <div className="prefs-section">
                  <label>{t.idioma}</label>
                  <div className="btn-group-toggle">
                    <button className={idioma === 'es' ? 'active' : ''} onClick={() => setIdioma('es')}>
                      {t.espanyol} 🇪🇸
                    </button>
                    <button className={idioma === 'en' ? 'active' : ''} onClick={() => setIdioma('en')}>
                      {t.ingles} 🇬🇧
                    </button>
                  </div>
                </div>
              )}
              {modalActivo === 'ayuda' && (
                <div className="help-info text-center">
                  <p>{t.ayudaContenido}</p>
                </div>
              )}
              {modalActivo === 'acerca' && (
                <div className="text-center">
                  <h5 className="text-warning">{t.acercaContenido}</h5>
                </div>
              )}
            </div>
            <button className="btn-confirm-prefs mt-4" onClick={() => setModalActivo(null)}>
              {t.cerrar}
            </button>
          </div>
        </div>
      )}

      <main className="App-main">
        <div className="cont_sesion">
          <form className='form-conte' onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" style={{ color: 'red', marginBottom: '15px' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" style={{ color: 'green', marginBottom: '15px' }}>
                {success}
              </div>
            )}

            <div className="form-group">
              <label>{t.nombre}</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.correo}</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.contrasena}</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.repetirContrasena}</label>
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
                onClick={() => navigate('/')}
                disabled={loading}
              >
                {t.volver}
              </button>
              <button
                type="submit"
                className="btn-confirmar"
                disabled={loading}
              >
                {loading ? t.registrando : t.confirmar}
              </button>
            </div>
          </form>
        </div>
      </main>
      <footer className="App-footer">
        <div>© IES José Zerpa - Cafetería</div>
      </footer>
    </div>
  );
}

export default Registrarse;