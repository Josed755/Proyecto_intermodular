import './App.css';
import cafeImg from './imagenes/Deus_Coffee.png';
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("./components/InicioSesion.js"); 
  };



  return (
    <div className="App">
      <header className="App-header">
        <div className="title">CafES App</div>
      </header>
      <main className="App-main">
        <div className="cont_sesion">
            <img src={cafeImg} alt={""} className="CafeImg"/>
            <button className="sesion_inicio" onClick={handleClick}>Iniciar Sesión</button>
            <button className="sesion_regis" >Registrarse</button>
        </div>
      </main>
      <footer className="App-footer">
        <div>© IES José Zerpa - etc...</div>
      </footer>
    </div>
  );
}

export default App;
