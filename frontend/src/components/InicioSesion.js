import '../App.css';
import './EstiloSesiones.css';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { loginUsuario, setAuthToken, setUsuario } from '../services/api';
import { FaEye, FaEyeSlash, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

function InicioSesion() {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalActivo, setModalActivo] = useState(null);

  const textos = {
    es: {
      titulo: 'Inicio de Sesión',
      correo: 'Correo:',
      contrasena: 'Contraseña:',
      volver: 'Volver',
      confirmar: 'Confirmar',
      cargando: 'Cargando...',
      idioma: 'Idioma',
      ayuda: 'Ayuda',
      acerca: 'Acerca de',
      cerrar: 'Cerrar',
      espanyol: 'Español',
      ingles: 'Inglés',
      ayudaP1: 'Introduce tu correo electrónico y contraseña para acceder a tu cuenta. Si olvidaste tu contraseña, contacta con el administrador de tu centro.',
      ayudaP2: 'Si aún no tienes cuenta, vuelve a la página principal y pulsa "Registrarse". Necesitarás un correo válido y una contraseña de al menos 8 caracteres.',
      acercaH5: 'CafES App v1.0',
      acercaP: 'CafES App v1.0 - Aplicación de gestión de pedidos de cafetería desarrollada para los centros IES José Zerpa, IES Santa Lucia y El Doctoral.',
      errorServidor: 'Error en el servidor'
    },
    en: {
      titulo: 'Login',
      correo: 'Email:',
      contrasena: 'Password:',
      volver: 'Back',
      confirmar: 'Confirm',
      cargando: 'Loading...',
      idioma: 'Language',
      ayuda: 'Help',
      acerca: 'About',
      cerrar: 'Close',
      espanyol: 'Spanish',
      ingles: 'English',
      ayudaP1: 'Enter your email and password to access your account. If you forgot your password, contact your center administrator.',
      ayudaP2: 'If you don\'t have an account yet, go back to the main page and click "Register". You will need a valid email and a password of at least 8 characters.',
      acercaH5: 'CafES App v1.0',
      acercaP: 'CafES App v1.0 - Cafeteria order management application developed for IES José Zerpa, IES Santa Lucia and El Doctoral.',
      errorServidor: 'Server error'
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
    setLoading(true);

    try {
      const response = await loginUsuario(formData);
      setAuthToken(response.data.token);
      setUsuario(response.data.usuario);
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.error || t.errorServidor);
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
    <div className="App premium-bg">
      <header className="App-header premium-header">
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
          <div className="prefs-modal premium-card">
            <h3>{t[modalActivo]}</h3>
            <div className="modal-content-area">
              {modalActivo === 'idioma' && (
                <div className="prefs-section">
                  <label>{t.idioma}</label>
                  <div className="btn-group-toggle">
                    <button className={idioma === 'es' ? 'active' : ''} onClick={() => setIdioma('es')}>
                      {t.espanyol}
                    </button>
                    <button className={idioma === 'en' ? 'active' : ''} onClick={() => setIdioma('en')}>
                      {t.ingles}
                    </button>
                  </div>
                </div>
              )}
              {modalActivo === 'ayuda' && (
                <div className="help-info text-center">
                  <p>{t.ayudaP1}</p>
                  <p className="small text-white-50">{t.ayudaP2}</p>
                </div>
              )}
              {modalActivo === 'acerca' && (
                <div className="text-center">
                  <h5 className="text-warning">{t.acercaH5}</h5>
                  <p className="small">{t.acercaP}</p>
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
        <div className="cont_sesion premium-card">
          <form className='form-cont' onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger error-alert">
                {error}
              </div>
            )}

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
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button" 
                  className="btn-toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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
                {loading ? t.cargando : t.confirmar}
              </button>
            </div>
          </form>
        </div>
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{t.titulo}</h4>
            <p>{idioma === 'es' ? 'Horario de pedidos: L-V antes de las 08:00 o después de las 14:00. Fines de semana disponible todo el día.' : 'Order hours: M-F before 08:00 or after 14:00. Weekends available all day.'}</p>
          </div>
          <div className="footer-section">
            <h4>{idioma === 'es' ? 'Contactos' : 'Contacts'}</h4>
            <div className="mb-3">
              <p className="fw-bold mb-0 text-white">IES José Zerpa</p>
              <p className="small mb-0"><FaPhoneAlt /> 928 75 41 00</p>
              <p className="small"><FaMapMarkerAlt /> C. Atindana, s/n, 35110 Vecindario</p>
            </div>
            <div className="mb-3">
              <p className="fw-bold mb-0 text-white">IES Santa Lucía</p>
              <p className="small mb-0"><FaPhoneAlt /> 928 12 50 30</p>
              <p className="small"><FaMapMarkerAlt /> Avda. de la Unión, 97, 35110 Casa Pastores</p>
            </div>
            <div className="mb-0">
              <p className="fw-bold mb-0 text-white">IES El Doctoral</p>
              <p className="small mb-0"><FaPhoneAlt /> 928 79 20 13</p>
              <p className="small"><FaMapMarkerAlt /> C/ Tiscamanita, s/n, 35280 El Doctoral</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom text-center">
          <div>© {new Date().getFullYear()} Canarias Educación - {idioma === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}</div>
        </div>
      </footer>
    </div>
  );
}

export default InicioSesion;