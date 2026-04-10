import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductos, addProducto, updateProducto, deleteProducto, getAdminPedidos, getAdminUsuarios, updateUsuarioStatus, addUsuario } from '../services/api';
import './EstiloInicio.css'; // Reutilizamos estilos base
import './EstiloSesiones.css'; // Para modales y formularios
import './EstiloAdmin.css';
import { getAdminProductos, toggleProductoEstado } from '../services/api';

const AdminDashboard = () => {
    const [productos, setProductos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [vista, setVista] = useState('productos'); // 'productos', 'pedidos' o 'usuarios'
    const [modalProducto, setModalProducto] = useState(null); // null o { product data }
    const [modalUsuario, setModalUsuario] = useState(null); // null o { user data }
    const [filtroCentro, setFiltroCentro] = useState('');
    const [error, setError] = useState('');
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const toggleProducto = async (producto) => {
        try {
            await toggleProductoEstado(producto.id, !producto.activo);
            cargarDatos();
        } catch (err) {
            setError('Error cambiando estado: ' + err.message);
        }
    };

    useEffect(() => {
        // Verificar si es admin al cargar
        const user = JSON.parse(localStorage.getItem('usuario'));
        if (!user || user.tipo !== 'admin') {
            navigate('/home');
        }
        cargarDatos();

        const handleClickAfuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickAfuera);
        return () => document.removeEventListener('mousedown', handleClickAfuera);
    }, [navigate]);

    const cargarDatos = async () => {
        try {
            const prodData = await getAdminProductos();
            setProductos(prodData.data || prodData);

            const pedData = await getAdminPedidos({ centro: filtroCentro });
            setPedidos(pedData.data || pedData);

            const userData = await getAdminUsuarios();
            setUsuarios(userData.data || userData);
        } catch (err) {
            setError('Error cargando datos: ' + err.message);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [filtroCentro, vista]);

    const handleSaveProducto = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = { ...modalProducto, ...Object.fromEntries(formData.entries()) };

        try {
            if (modalProducto.id) {
                await updateProducto(modalProducto.id, {
                    ...data,
                    precio: parseFloat(data.precio),
                    categoria_id: parseInt(data.categoria_id)
                });
            } else {
                await addProducto({
                    ...data,
                    precio: parseFloat(data.precio),
                    categoria_id: parseInt(data.categoria_id)
                });
            }
            setModalProducto(null);
            cargarDatos();
        } catch (err) {
            setError('Error al guardar: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de desactivar este producto?')) {
            try {
                await deleteProducto(id);
                cargarDatos();
            } catch (err) {
                setError('Error al eliminar: ' + err.message);
            }
        }
    };

    const handleUpdateUsuario = async (uId, campos) => {
        try {
            await updateUsuarioStatus(uId, campos);
            cargarDatos();
        } catch (err) {
            setError('Error al actualizar usuario: ' + err.message);
        }
    };

    const handleSaveUsuario = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await addUsuario(data);
            setModalUsuario(null);
            cargarDatos();
        } catch (err) {
            setError('Error creando empleado: ' + err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/');
    };

    const getIniciales = (nombre) => {
        if (!nombre) return '?';
        const partes = nombre.trim().split(/\s+/);
        if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
        return partes[0][0].toUpperCase();
    };

    return (
        <div className="App admin-container">
            <header className="App-header">
                <div className="header-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button className="btn-circle-back" title="Volver" onClick={() => navigate('/home')}>
                            <span>❮</span>
                        </button>
                        <div className="title">Panel Admin - CafES</div>
                    </div>

                    <div className="header-right">
                        <div className="user-menu-wrapper" ref={menuRef}>
                            <div
                                className={`user-profile ${menuAbierto ? 'active' : ''}`}
                                onClick={() => setMenuAbierto(!menuAbierto)}
                            >
                                <div className="user-avatar">{getIniciales(usuario?.nombre)}</div>
                                <span className="user-name">{usuario?.nombre || 'Admin'}</span>
                                <span className="chevron">▼</span>
                            </div>

                            {menuAbierto && (
                                <div className="user-dropdown shadow-lg">
                                    <button className="dropdown-item" onClick={() => navigate('/home')}>
                                        🏠 Inicio
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="App-main admin-main">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="glass-panel p-4">
                    {/* Botones de navegación encima de la lista */}
                    <div className="tabs-container mb-4" style={{ justifyContent: 'flex-start' }}>
                        <button className={`sesion_inicio ${vista === 'productos' ? 'active-tab' : ''}`} onClick={() => setVista('productos')}>Productos</button>
                        <button className={`sesion_inicio ${vista === 'pedidos' ? 'active-tab' : ''}`} onClick={() => setVista('pedidos')}>Pedidos</button>
                        <button className={`sesion_inicio ${vista === 'usuarios' ? 'active-tab' : ''}`} onClick={() => setVista('usuarios')}>Empleados</button>
                    </div>

                    {vista === 'productos' && (
                        <div>
                            <div className="d-flex justify-content-between mb-3">
                                <h3>Gestión de Productos</h3>
                                <button className="btn btn-success" onClick={() => setModalProducto({ nombre: '', precio: 0, descripcion: '', categoria_id: 1 })}>+ Nuevo Producto</button>
                            </div>
                            <table className="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Precio</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.nombre}</td>
                                            <td>{p.precio}€</td>
                                            <td>{p.activo ? '✅' : '❌'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-success me-2" onClick={() => setModalProducto(p)}>Editar</button>
                                                <button
                                                    className={`btn btn-sm ${p.activo ? 'btn-danger' : 'btn-success'}`}
                                                    onClick={() => toggleProducto(p)}
                                                >
                                                    {p.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {vista === 'pedidos' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>Historial de Pedidos (Global)</h3>
                                <div className="d-flex align-items-center gap-2">
                                    <label className="text-white-50 small">Filtrar por centro:</label>
                                    <select
                                        className="form-select form-select-sm bg-dark text-white border-secondary"
                                        style={{ width: '200px' }}
                                        value={filtroCentro}
                                        onChange={(e) => setFiltroCentro(e.target.value)}
                                    >
                                        <option value="">Todos los centros</option>
                                        <option value="IES José Zerpa">IES José Zerpa</option>
                                        <option value="Centro Ejemplo A">Centro Ejemplo A</option>
                                        <option value="Centro Ejemplo B">Centro Ejemplo B</option>
                                    </select>
                                </div>
                            </div>
                            <table className="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos.map(p => (
                                        <tr key={p.id}>
                                            <td>#{p.id}</td>
                                            <td>{p.usuario_nombre}</td>
                                            <td>{new Date(p.fecha).toLocaleString()}</td>
                                            <td>{p.total}€</td>
                                            <td>{p.estado}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {vista === 'usuarios' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 className="mb-0">Gestión de Empleados</h3>
                                <button className="btn btn-success" onClick={() => setModalUsuario({ nombre: '', correo: '', contrasena: '', tipo: 'empleado' })}>
                                    + Añadir Empleado
                                </button>
                            </div>
                            <table className="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                        <th>Turno</th>
                                        <th>Estado Account</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.nombre}</td>
                                            <td>{u.correo}</td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm bg-dark text-white"
                                                    defaultValue={u.tipo}
                                                    onChange={(e) => handleUpdateUsuario(u.id, { tipo: e.target.value, activo: u.activo, turno: u.turno })}
                                                >
                                                    <option value="empleado">Empleado</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm bg-dark text-white"
                                                    defaultValue={u.turno || 'mañana'}
                                                    onChange={(e) => handleUpdateUsuario(u.id, { tipo: u.tipo, activo: u.activo, turno: e.target.value })}
                                                >
                                                    <option value="mañana">Mañana</option>
                                                    <option value="tarde">Tarde</option>
                                                </select>
                                            </td>
                                            <td>{u.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                                                    onClick={() => handleUpdateUsuario(u.id, { tipo: u.tipo, activo: !u.activo, turno: u.turno })}
                                                >
                                                    {u.activo ? 'Bloquear' : 'Desbloquear'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {modalProducto && (
                    <div className="prefs-overlay">
                        <div className="prefs-modal shadow-lg admin-modal">
                            <h3>{modalProducto.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <form onSubmit={handleSaveProducto}>
                                <div className="mb-3">
                                    <label>Nombre</label>
                                    <input type="text" name="nombre" className="form-control" defaultValue={modalProducto.nombre} required />
                                </div>
                                <div className="mb-3">
                                    <label>Precio</label>
                                    <input type="number" step="0.01" name="precio" className="form-control" defaultValue={modalProducto.precio} required />
                                </div>
                                <div className="mb-3">
                                    <label>Descripción</label>
                                    <textarea name="descripcion" className="form-control" defaultValue={modalProducto.descripcion}></textarea>
                                </div>
                                <div className="mb-3">
                                    <label>Categoría ID</label>
                                    <input type="number" name="categoria_id" className="form-control" defaultValue={modalProducto.categoria_id} required />
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn-confirm-prefs">Guardar</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalProducto(null)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {modalUsuario && (
                    <div className="prefs-overlay">
                        <div className="prefs-modal shadow-lg admin-modal">
                            <h3>Nuevo Empleado</h3>
                            <form onSubmit={handleSaveUsuario}>
                                <div className="mb-3">
                                    <label>Nombre</label>
                                    <input type="text" name="nombre" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label>Correo Electrónico</label>
                                    <input type="email" name="correo" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label>Contraseña</label>
                                    <input type="password" name="contrasena" className="form-control" required minLength="8" />
                                </div>
                                <div className="mb-3">
                                    <label>Rol</label>
                                    <select name="tipo" className="form-select" defaultValue="empleado">
                                        <option value="empleado">Empleado</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label>Turno</label>
                                    <select name="turno" className="form-select" defaultValue="mañana">
                                        <option value="mañana">Mañana</option>
                                        <option value="tarde">Tarde</option>
                                    </select>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn-confirm-prefs">Guardar</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalUsuario(null)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
