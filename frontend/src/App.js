import './App.css';
import './components/EstiloSesiones.css'; // Reutilizamos los estilos de las sesiones
import cafeImg from './imagenes/Deus_Coffee.png';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaMapMarkerAlt, FaClock, FaPhoneAlt } from 'react-icons/fa';

function App() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalActivo, setModalActivo] = useState(null);

  const textos = {
    es: {
      titulo: 'CafES App',
      iniciarSesion: 'Iniciar Sesión',
      registrarse: 'Registrarse',
      idioma: 'Idioma',
      ayuda: 'Ayuda',
      acerca: 'Acerca de',
      cerrar: 'Cerrar',
      espanyol: 'Español',
      ingles: 'Inglés',
      ayudaP1: 'Bienvenido a CafES App.',
      ayudaP2: 'Inicia sesión para pedir tus cafés o regístrate si es tu primera vez.',
      acercaH5: 'CafES App v1.0',
      acercaP: 'CafES App v1.0 - Aplicación de gestión de pedidos de cafetería desarrollada para los centros IES José Zerpa, IES Santa Lucia y El Doctoral.'
    },
    en: {
      titulo: 'CafES App',
      iniciarSesion: 'Login',
      registrarse: 'Register',
      idioma: 'Language',
      ayuda: 'Help',
      acerca: 'About',
      cerrar: 'Close',
      espanyol: 'Spanish',
      ingles: 'English',
      ayudaP1: 'Welcome to CafES App.',
      ayudaP2: 'Log in to order your coffees or register if it is your first time.',
      acercaH5: 'CafES App v1.0',
      acercaP: 'CafES App v1.0 - Cafeteria order management application developed for IES José Zerpa, IES Santa Lucia and El Doctoral.'
    }
  };

  const t = textos[idioma];

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
                <div className="user-dropdown shadow-lg">
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
                <div className="help-info">
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
          <img src={cafeImg} alt={""} className="CafeImg" />
          <button className="sesion_inicio" onClick={() => navigate("/login")}>{t.iniciarSesion}</button>
          <button className="sesion_regis" onClick={() => navigate("/register")}>{t.registrarse}</button>
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

export default App;
