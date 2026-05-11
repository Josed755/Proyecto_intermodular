import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductos, addProducto, updateProducto, deleteProducto, getAdminPedidos, getAdminUsuarios, updateUsuarioStatus, addUsuario, getIngredientes } from '../services/api';
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
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [todosLosIngredientes, setTodosLosIngredientes] = useState([]);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const [idioma] = useState(localStorage.getItem('idioma') || 'es');

    const textos = {
        es: {
            volver: 'Volver',
            panelAdmin: 'Panel Admin - CafES',
            inicio: 'Inicio',
            cerrarSesion: 'Cerrar Sesión',
            productos: 'Productos',
            pedidos: 'Pedidos',
            empleados: 'Empleados',
            gestionProductos: 'Gestión de Productos',
            nuevoProducto: '+ Nuevo Producto',
            nombre: 'Nombre',
            precio: 'Precio',
            estado: 'Estado',
            acciones: 'Acciones',
            editar: 'Editar',
            desactivar: 'Desactivar',
            activar: 'Activar',
            historialPedidos: 'Historial de Pedidos (Global)',
            filtrarCentro: 'Filtrar por centro:',
            todosCentros: 'Todos los centros',
            id: 'ID',
            usuario: 'Usuario',
            fecha: 'Fecha',
            total: 'Total',
            gestionEmpleados: 'Gestión de Empleados',
            nuevoEmpleado: '+ Añadir Empleado',
            correo: 'Correo',
            rol: 'Rol',
            turno: 'Turno',
            estadoCuenta: 'Estado Account',
            empleado: 'Empleado',
            admin: 'Administrador',
            manyana: 'Mañana',
            tarde: 'Tarde',
            activo: 'Activo',
            inactivo: 'Inactivo',
            bloquear: 'Bloquear',
            desbloquear: 'Desbloquear',
            editarProducto: 'Editar Producto',
            crearProducto: 'Nuevo Producto',
            descripcion: 'Descripción',
            categoriaId: 'Categoría ID',
            guardar: 'Guardar',
            cancelar: 'Cancelar',
            crearEmpleado: 'Nuevo Empleado',
            contrasena: 'Contraseña',
            imagen: 'Ruta de Imagen',
            categoriaMenu: 'Categoría de Menú',
            catBebidasCalientes: 'Bebidas Calientes',
            catBebidasFrias: 'Bebidas Frías',
            catGolosinas: 'Golosinas',
            catBocadillos: 'Bocadillos',
            seguroEliminar: '¿Estás seguro de desactivar este producto?',
            errorCargando: 'Error cargando datos: ',
            errorCambioEstado: 'Error cambiando estado: ',
            errorGuardar: 'Error al guardar: ',
            errorEliminar: 'Error al eliminar: ',
            errorActUsuario: 'Error al actualizar usuario: ',
            errorCrearEmpleado: 'Error creando empleado: ',
            eliminar: 'Eliminar',
            confirmarBorrado: '¿Seguro?',
            categoria: 'Categoría',
            ingredientes: 'Ingredientes'
        },
        en: {
            volver: 'Back',
            panelAdmin: 'Admin Panel - CafES',
            inicio: 'Home',
            cerrarSesion: 'Logout',
            productos: 'Products',
            pedidos: 'Orders',
            empleados: 'Employees',
            gestionProductos: 'Product Management',
            nuevoProducto: '+ New Product',
            nombre: 'Name',
            precio: 'Price',
            estado: 'Status',
            acciones: 'Actions',
            editar: 'Edit',
            desactivar: 'Deactivate',
            activar: 'Activate',
            historialPedidos: 'Order History (Global)',
            filtrarCentro: 'Filter by center:',
            todosCentros: 'All centers',
            id: 'ID',
            usuario: 'User',
            fecha: 'Date',
            total: 'Total',
            gestionEmpleados: 'Employee Management',
            nuevoEmpleado: '+ Add Employee',
            correo: 'Email',
            rol: 'Role',
            turno: 'Shift',
            estadoCuenta: 'Account Status',
            empleado: 'Employee',
            admin: 'Admin',
            manyana: 'Morning',
            tarde: 'Afternoon',
            activo: 'Active',
            inactivo: 'Inactive',
            bloquear: 'Block',
            desbloquear: 'Unblock',
            editarProducto: 'Edit Product',
            crearProducto: 'New Product',
            descripcion: 'Description',
            categoriaId: 'Category ID',
            guardar: 'Save',
            cancelar: 'Cancel',
            crearEmpleado: 'New Employee',
            contrasena: 'Password',
            imagen: 'Image Path',
            categoriaMenu: 'Menu Category',
            catBebidasCalientes: 'Hot Drinks',
            catBebidasFrias: 'Cold Drinks',
            catGolosinas: 'Snacks',
            catBocadillos: 'Sandwiches',
            seguroEliminar: 'Are you sure you want to deactivate this product?',
            errorCargando: 'Error loading data: ',
            errorCambioEstado: 'Error changing status: ',
            errorGuardar: 'Error saving: ',
            errorEliminar: 'Error deleting: ',
            errorActUsuario: 'Error updating user: ',
            errorCrearEmpleado: 'Error creating employee: ',
            eliminar: 'Delete',
            confirmarBorrado: 'Sure?',
            categoria: 'Category',
            ingredientes: 'Ingredients'
        }
    };

    const t = textos[idioma];
    const usuarioLogged = JSON.parse(localStorage.getItem('usuario'));

    const toggleProducto = async (producto) => {
        try {
            await toggleProductoEstado(producto._id || producto.id, !producto.activo);
            cargarDatos();
        } catch (err) {
            setError(t.errorCambioEstado + err.message);
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

        const ingData = await getIngredientes();
        setTodosLosIngredientes(ingData.data || ingData);
    } catch (err) {
        setError(t.errorCargando + err.message);
    }
};

useEffect(() => {
    cargarDatos();
}, [filtroCentro, vista]);

const handleSaveProducto = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
        ...modalProducto,
        nombre: data.nombre,
        precio: parseFloat(data.precio),
        descripcion: data.descripcion,
        categoria_id: parseInt(data.categoria_id),
        categoria: data.categoria,
        imagen: data.imagen,
        ingredientes: ingredientesSeleccionados
    };

    try {
        if (modalProducto._id || modalProducto.id) {
            await updateProducto(modalProducto._id || modalProducto.id, payload);
        } else {
            await addProducto(payload);
        }
        setModalProducto(null);
        cargarDatos();
    } catch (err) {
        setError(t.errorGuardar + err.message);
    }
};

const abrirModalProducto = (p) => {
    setModalProducto(p);
    setIngredientesSeleccionados(p.ingredientes || []);
};

const handleDelete = async (id) => {
    // Si ya habíamos pulsado una vez (confirmDeleteId ya tiene este ID)
    if (confirmDeleteId && confirmDeleteId.toString() === id.toString()) {
        try {
            setConfirmDeleteId('loading'); // Estado temporal para feedback
            await deleteProducto(id);
            setConfirmDeleteId(null);
            cargarDatos();
        } catch (err) {
            setError(t.errorEliminar + err.message);
            setConfirmDeleteId(null);
        }
    } else {
        // Primera pulsación: guardamos el ID para confirmar
        setConfirmDeleteId(id);
        // Cancelar la confirmación si no pulsa en 4 segundos
        setTimeout(() => {
            setConfirmDeleteId(prev => (prev === id ? null : prev));
        }, 4000);
    }
};

const handleUpdateUsuario = async (uId, campos) => {
    try {
        await updateUsuarioStatus(uId, campos);
        cargarDatos();
    } catch (err) {
        setError(t.errorActUsuario + err.message);
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
        setError(t.errorCrearEmpleado + err.message);
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
                    <button className="btn-circle-back" title={t.volver} onClick={() => navigate('/home')}>
                        <span>❮</span>
                    </button>
                    <div className="title">{t.panelAdmin}</div>
                </div>

                <div className="header-right">
                    <div className="user-menu-wrapper" ref={menuRef}>
                        <div
                            className={`user-profile ${menuAbierto ? 'active' : ''}`}
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >
                            <div className="user-avatar">{getIniciales(usuarioLogged?.nombre)}</div>
                            <span className="user-name">{usuarioLogged?.nombre || 'Admin'}</span>
                            <span className="chevron">▼</span>
                        </div>

                        {menuAbierto && (
                            <div className="user-dropdown shadow-lg">
                                <button className="dropdown-item" onClick={() => navigate('/home')}>
                                    🏠 {t.inicio}
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    🚪 {t.cerrarSesion}
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
                <div className="tabs-container mb-4" style={{ justifyContent: 'flex-start' }}>
                    <button className={`sesion_inicio ${vista === 'productos' ? 'active-tab' : ''}`} onClick={() => setVista('productos')}>{t.productos}</button>
                    <button className={`sesion_inicio ${vista === 'pedidos' ? 'active-tab' : ''}`} onClick={() => setVista('pedidos')}>{t.pedidos}</button>
                    <button className={`sesion_inicio ${vista === 'usuarios' ? 'active-tab' : ''}`} onClick={() => setVista('usuarios')}>{t.empleados}</button>
                </div>

                {vista === 'productos' && (
                    <div>
                        <div className="d-flex justify-content-between mb-3">
                            <h3>{t.gestionProductos}</h3>
                            <button className="btn btn-success" onClick={() => abrirModalProducto({ nombre: '', precio: 0, descripcion: '', categoria_id: 1, ingredientes: [] })}>{t.nuevoProducto}</button>
                        </div>
                        {/* Vista de Tabla (Desktop) */}
                        <div className="d-none d-md-block">
                            <table className="table table-dark table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>{t.nombre}</th>
                                        <th>{t.precio}</th>
                                        <th>{t.categoria}</th>
                                        <th>{t.estado}</th>
                                        <th>{t.acciones}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map(p => (
                                        <tr key={p._id || p.id}>
                                            <td>
                                                <div className="fw-bold">{p.nombre}</div>
                                                <small className="text-white-50">{p.descripcion?.substring(0, 30)}...</small>
                                            </td>
                                            <td>{p.precio}€</td>
                                            <td><span className="badge bg-secondary">{p.categoria}</span></td>
                                            <td>{p.activo ? '✅' : '❌'}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-sm btn-success" onClick={() => abrirModalProducto(p)}>{t.editar}</button>
                                                    <button
                                                        className={`btn btn-sm ${p.activo ? 'btn-outline-warning' : 'btn-success'}`}
                                                        onClick={() => toggleProducto(p)}
                                                    >
                                                        {p.activo ? t.desactivar : t.activar}
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm ${confirmDeleteId === (p._id || p.id) ? 'btn-danger animate__animated animate__pulse' : 'btn-outline-danger'}`}
                                                        onClick={() => handleDelete(p._id || p.id)}
                                                        disabled={confirmDeleteId === 'loading'}
                                                    >
                                                        {confirmDeleteId === 'loading' ? '...' : (confirmDeleteId === (p._id || p.id) ? t.confirmarBorrado : t.eliminar)}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Vista de Tarjetas (Móvil) */}
                        <div className="d-md-none">
                            {productos.map(p => (
                                <div key={p._id || p.id} className="admin-mobile-card mb-3 p-3 shadow-sm" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="mb-0 text-warning">{p.nombre}</h5>
                                        <span className="badge bg-dark">{p.precio}€</span>
                                    </div>
                                    <p className="small text-white-50 mb-2">{p.descripcion}</p>
                                    <div className="mb-3">
                                        <span className="badge bg-secondary me-2">{p.categoria}</span>
                                        {p.activo ? <span className="text-success small">● {t.activo}</span> : <span className="text-danger small">● {t.inactivo}</span>}
                                    </div>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <button className="btn btn-sm btn-success flex-grow-1" onClick={() => abrirModalProducto(p)}>{t.editar}</button>
                                        <button className="btn btn-sm btn-outline-warning flex-grow-1" onClick={() => toggleProducto(p)}>{p.activo ? t.desactivar : t.activar}</button>
                                        <button 
                                            className={`btn btn-sm flex-grow-1 ${confirmDeleteId === (p._id || p.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                                            onClick={() => handleDelete(p._id || p.id)}
                                            disabled={confirmDeleteId === 'loading'}
                                        >
                                            {confirmDeleteId === 'loading' ? '...' : (confirmDeleteId === (p._id || p.id) ? t.confirmarBorrado : t.eliminar)}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {vista === 'pedidos' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>{t.historialPedidos}</h3>
                            <div className="d-flex align-items-center gap-2">
                                <label className="text-white-50 small">{t.filtrarCentro}</label>
                                <select
                                    className="form-select form-select-sm bg-dark text-white border-secondary"
                                    style={{ width: '200px' }}
                                    value={filtroCentro}
                                    onChange={(e) => setFiltroCentro(e.target.value)}
                                >
                                    <option value="">{t.todosCentros}</option>
                                    <option value="IES José Zerpa">IES José Zerpa</option>
                                    <option value="Centro Ejemplo A">Centro Ejemplo A</option>
                                    <option value="Centro Ejemplo B">Centro Ejemplo B</option>
                                </select>
                            </div>
                        </div>
                        <table className="table table-dark table-hover">
                            <thead>
                                <tr>
                                    <th>{t.id}</th>
                                    <th>{t.usuario}</th>
                                    <th>{t.fecha}</th>
                                    <th>{t.total}</th>
                                    <th>{t.estado}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map(p => (
                                    <tr key={p._id || p.id}>
                                        <td>#{p._id || p.id}</td>
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
                            <h3 className="mb-0">{t.gestionEmpleados}</h3>
                            <button className="btn btn-success" onClick={() => setModalUsuario({ nombre: '', correo: '', contrasena: '', tipo: 'empleado' })}>
                                {t.nuevoEmpleado}
                            </button>
                        </div>
                        <table className="table table-dark table-hover">
                            <thead>
                                <tr>
                                    <th>{t.nombre}</th>
                                    <th>{t.correo}</th>
                                    <th>{t.rol}</th>
                                    <th>{t.turno}</th>
                                    <th>{t.estadoCuenta}</th>
                                    <th>{t.acciones}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u._id || u.id}>
                                        <td>{u.nombre}</td>
                                        <td>{u.correo}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm bg-dark text-white"
                                                defaultValue={u.tipo}
                                                onChange={(e) => handleUpdateUsuario(u._id || u.id, { tipo: e.target.value, activo: u.activo, turno: u.turno })}
                                            >
                                                <option value="empleado">{t.empleado}</option>
                                                <option value="admin">{t.admin}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm bg-dark text-white"
                                                defaultValue={u.turno || 'mañana'}
                                                onChange={(e) => handleUpdateUsuario(u._id || u.id, { tipo: u.tipo, activo: u.activo, turno: e.target.value })}
                                            >
                                                <option value="mañana">{t.manyana}</option>
                                                <option value="tarde">{t.tarde}</option>
                                            </select>
                                        </td>
                                        <td>{u.activo ? `✅ ${t.activo}` : `❌ ${t.inactivo}`}</td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => handleUpdateUsuario(u._id || u.id, { tipo: u.tipo, activo: !u.activo, turno: u.turno })}
                                            >
                                                {u.activo ? t.bloquear : t.desbloquear}
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
                        <h3>{modalProducto.id ? t.editarProducto : t.crearProducto}</h3>
                        <form onSubmit={handleSaveProducto}>
                            <div className="mb-3">
                                <label>{t.nombre}</label>
                                <input type="text" name="nombre" className="form-control" defaultValue={modalProducto.nombre} required />
                            </div>
                            <div className="mb-3">
                                <label>{t.precio}</label>
                                <input type="number" step="0.01" name="precio" className="form-control" defaultValue={modalProducto.precio} required />
                            </div>
                            <div className="mb-3">
                                <label>{t.descripcion}</label>
                                <textarea name="descripcion" className="form-control" defaultValue={modalProducto.descripcion}></textarea>
                            </div>
                            <div className="mb-3">
                                <label>{t.categoriaId}</label>
                                <input type="number" name="categoria_id" className="form-control" defaultValue={modalProducto.categoria_id} required />
                                <small className="text-white-50">3 = Bocadillo personalizable, 1 = Normal</small>
                            </div>
                            <div className="mb-3">
                                <label>{t.categoriaMenu}</label>
                                <select name="categoria" className="form-select" defaultValue={modalProducto.categoria}>
                                    <option value="bebidasCalientes">{t.catBebidasCalientes}</option>
                                    <option value="bebidasFrias">{t.catBebidasFrias}</option>
                                    <option value="golosinas">{t.catGolosinas}</option>
                                    <option value="bocadillos">{t.catBocadillos}</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>{t.imagen}</label>
                                <input type="text" name="imagen" className="form-control" defaultValue={modalProducto.imagen} placeholder="/imagenes/ejemplo.png" />
                            </div>
                            
                            <div className="mb-3">
                                <label className="text-warning fw-bold">{t.ingredientes}</label>
                                <div className="ingredients-grid p-2 border border-secondary rounded bg-dark" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {todosLosIngredientes.map(ing => (
                                        <div key={ing.id} className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id={`ing-${ing.id}`}
                                                checked={ingredientesSeleccionados.includes(ing.nombre)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setIngredientesSeleccionados([...ingredientesSeleccionados, ing.nombre]);
                                                    } else {
                                                        setIngredientesSeleccionados(ingredientesSeleccionados.filter(name => name !== ing.nombre));
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label text-white small" htmlFor={`ing-${ing.id}`}>
                                                {ing.nombre}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <small className="text-white-50">Selecciona los ingredientes que este producto puede llevar.</small>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn-confirm-prefs">{t.guardar}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setModalProducto(null)}>{t.cancelar}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {modalUsuario && (
                <div className="prefs-overlay">
                    <div className="prefs-modal shadow-lg admin-modal">
                        <h3>{t.crearEmpleado}</h3>
                        <form onSubmit={handleSaveUsuario}>
                            <div className="mb-3">
                                <label>{t.nombre}</label>
                                <input type="text" name="nombre" className="form-control" required />
                            </div>
                            <div className="mb-3">
                                <label>{t.correo}</label>
                                <input type="email" name="correo" className="form-control" required />
                            </div>
                            <div className="mb-3">
                                <label>{t.contrasena}</label>
                                <input type="password" name="contrasena" className="form-control" required minLength="8" />
                            </div>
                            <div className="mb-3">
                                <label>{t.rol}</label>
                                <select name="tipo" className="form-select" defaultValue="empleado">
                                    <option value="empleado">{t.empleado}</option>
                                    <option value="admin">{t.admin}</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>{t.turno}</label>
                                <select name="turno" className="form-select" defaultValue="mañana">
                                    <option value="mañana">{t.manyana}</option>
                                    <option value="tarde">{t.tarde}</option>
                                </select>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn-confirm-prefs">{t.guardar}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setModalUsuario(null)}>{t.cancelar}</button>
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
