import './App.css';
import './components/EstiloSesiones.css'; // Reutilizamos los estilos de las sesiones
import cafeImg from './imagenes/Deus_Coffee.png';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

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
      ayudaP1: 'Bienvenido a la Cafetería del Zerpa.',
      ayudaP2: 'Inicia sesión para pedir tus cafés o regístrate si es tu primera vez.',
      acercaH5: 'CaffES App v1.0',
      acercaP: 'IES José Zerpa'
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
      ayudaP1: 'Welcome to the Zerpa Cafeteria.',
      ayudaP2: 'Log in to order your coffees or register if it is your first time.',
      acercaH5: 'CaffES App v1.0',
      acercaP: 'IES José Zerpa'
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
        <div className="cont_sesion">
          <img src={cafeImg} alt={""} className="CafeImg" />
          <button className="sesion_inicio" onClick={() => navigate("/login")}>{t.iniciarSesion}</button>
          <button className="sesion_regis" onClick={() => navigate("/register")}>{t.registrarse}</button>
        </div>
      </main>
      <footer className="App-footer">
        <div>© IES José Zerpa - Cafetería</div>
      </footer>
    </div>
  );
}

export default App;
