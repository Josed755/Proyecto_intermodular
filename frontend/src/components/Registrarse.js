import '../App.css';
import './Registrarse.css'
import { useNavigate } from 'react-router-dom';

function Registrarse() {
    const navigate = useNavigate();

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
                    <div className='form-conte'>
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
                        <div className="form-group">
                            <label>Repetir Contraseña:</label>
                            <input
                                type="password"
                                name="password"
                                required
                            />
                        </div>
                        <div className="btn-container">
                            <button className="btn-volver" onClick={handleVolver}>Volver</button>
                            <button type="submit" className="btn-confirmar">Confirmar</button>
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

export default Registrarse; 
