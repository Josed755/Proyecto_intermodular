import '../App.css';
import './EstiloSesiones.css';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { registrarUsuario } from '../services/api';
import { FaEye, FaEyeSlash, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

function Registrarse() {
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    contrasena: '',
    confirmarContrasena: '',
    centro: 'IES José Zerpa'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      ayudaP1: 'Crea una cuenta para realizar tus pedidos en CafES App.',
      ayudaP2: 'Necesitarás un correo válido, una contraseña con al menos 8 caracteres y seleccionar tu centro de recogida (IES José Zerpa, IES Santa Lucia o IES El Doctoral).',
      acercaH5: 'CafES App v1.0',
      acercaP: 'CafES App v1.0 - Aplicación de gestión de pedidos de cafetería desarrollada para los centros IES José Zerpa, IES Santa Lucia y El Doctoral.',
      centroRecogida: 'Centro de Recogida:',
      seleccionarCentro: 'Selecciona un centro',
      errorRegistro: 'Error en el registro'
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
      ayudaP1: 'Create an account to place your orders in CafES App.',
      ayudaP2: 'You will need a valid email, a password with at least 8 characters, and select your collection point (IES José Zerpa, IES Santa Lucia or IES El Doctoral).',
      acercaH5: 'CafES App v1.0',
      acercaP: 'CafES App v1.0 - Cafeteria order management application developed for IES José Zerpa, IES Santa Lucia and El Doctoral.',
      centroRecogida: 'Collection Point:',
      seleccionarCentro: 'Select a center',
      errorRegistro: 'Error registering',
      centros: {
        'IES José Zerpa': 'IES José Zerpa',
        'IES Santa Lucia': 'IES Santa Lucia',
        'IES El Doctoral': 'IES El Doctoral'
      }
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

    if (formData.contrasena.length < 8) {
      setError(t.errorLongitud);
      return;
    }

    setLoading(true);

    try {
      const datosRegistro = {
        correo: formData.correo,
        nombre: formData.nombre,
        contrasena: formData.contrasena,
        centro: formData.centro
      };

      await registrarUsuario(datosRegistro);

      setSuccess(t.exito);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || t.errorRegistro);
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
    <div className="App app-background">
      <header className="App-header app-header-main">
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
          <div className="prefs-modal app-card-container">
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
        <div className="cont_sesion app-card-container">
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
            <div className="form-group">
              <label>{t.repetirContrasena}</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>{t.centroRecogida}</label>
              <select
                name="centro"
                value={formData.centro}
                onChange={handleChange}
                required
                className="app-select-custom"
              >
                <option value="IES José Zerpa">IES José Zerpa</option>
                <option value="IES Santa Lucia">IES Santa Lucia</option>
                <option value="IES El Doctoral">IES El Doctoral</option>
              </select>
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
        <div className="footer-content">
          <div className="footer-section">
            <h4>CafES App</h4>
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
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Canarias Educación - {idioma === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}</div>
          <div><a href="mailto:josedanielhs755@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>josedanielhs755@gmail.com</a></div>
        </div>
      </footer>
    </div>
  );
}

export default Registrarse;
