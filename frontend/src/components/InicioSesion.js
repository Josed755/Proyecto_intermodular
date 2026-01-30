import '../App.css';
import './EstiloSesiones.css'
import { useNavigate } from 'react-router-dom';

function InicioSesion() {
    const navigate = useNavigate();

    const handleVolver = () => {
        navigate('/');
    };

    const handleConfirmar = () => {
        navigate('/home');
    };

    return (
        <div className="App">
            <header className="App-header">
                <div className="title">Inicio de Sesión</div>
            </header>
            <main className="App-main">
                <div className="cont_sesion">
                    <div className='form-cont'>
                        <div className="form-group">
                            <label>Gmail:</label>
                            <input
                                type="text"
                                name="gmail"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contraseña:</label>
                            <input
                                type="password"
                                name="password"
                                required
                            />
                        </div>
                        <div className="btn-container">
                            <button className="btn-volver" onClick={handleVolver}>Volver</button>
                            <button type="submit" className="btn-confirmar" onClick={handleConfirmar}>Confirmar</button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="App-footer">
                <div>© IES José Zerpa - etc...</div>
            </footer>
        </div>
    );
}

export default InicioSesion; 
