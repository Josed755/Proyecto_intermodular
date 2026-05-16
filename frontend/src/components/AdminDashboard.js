import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProducto, updateProducto, deleteProducto, getAdminPedidos, getAdminUsuarios, updateUsuarioStatus, addUsuario, getIngredientes } from '../services/api';
import './EstiloInicio.css'; // Reutilizamos estilos base
import './EstiloSesiones.css'; // Para modales y formularios
import './EstiloAdmin.css';
import { getAdminProductos, toggleProductoEstado, updatePedidoEstado } from '../services/api';

const AdminDashboard = () => {
    const [productos, setProductos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const usuarioLogged = JSON.parse(localStorage.getItem('usuario'));
    const [vista, setVista] = useState(usuarioLogged?.tipo === 'admin' ? 'productos' : 'pedidos');
    const [modalProducto, setModalProducto] = useState(null); // null o { product data }
    const [modalUsuario, setModalUsuario] = useState(null); // null o { user data }
    const [filtroCentro, setFiltroCentro] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');
    const [filtroCategoria, setFiltroCategoria] = useState('todos');
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [error, setError] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [todosLosIngredientes, setTodosLosIngredientes] = useState([]);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
    const [centrosSeleccionados, setCentrosSeleccionados] = useState(['IES José Zerpa', 'IES Santa Lucía', 'IES El Doctoral']);
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
            empleados: 'Usuarios',
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
            gestionEmpleados: 'Gestión de Usuarios',
            nuevoEmpleado: '+ Añadir Usuario',
            correo: 'Correo',
            rol: 'Rol',
            turno: 'Turno',
            estadoCuenta: 'Estado Cuenta',
            empleado: 'Empleado',
            admin: 'Administrador',
            cliente: 'Cliente',
            todosRoles: 'Todos los roles',
            filtrarRol: 'Filtrar por rol:',
            filtrarCategoria: 'Filtrar por categoría:',
            todos: 'Todos',
            buscarUsuario: 'Buscar por nombre o correo...',
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
            ingredientes: 'Ingredientes',
            estados: {
                'pendiente': 'Pendiente',
                'preparando': 'Preparando',
                'listo': 'Listo para recoger',
                'entregado': 'Entregado',
                'completado': 'Completado'
            }
        },
        en: {
            volver: 'Back',
            panelAdmin: 'Admin Panel - CafES',
            inicio: 'Home',
            cerrarSesion: 'Logout',
            productos: 'Products',
            pedidos: 'Orders',
            empleados: 'Users',
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
            gestionEmpleados: 'User Management',
            nuevoEmpleado: '+ Add User',
            correo: 'Email',
            rol: 'Role',
            turno: 'Shift',
            estadoCuenta: 'Account Status',
            empleado: 'Employee',
            admin: 'Admin',
            cliente: 'Client',
            todosRoles: 'All roles',
            filtrarRol: 'Filter by role:',
            filtrarCategoria: 'Filter by category:',
            todos: 'All',
            buscarUsuario: 'Search by name or email...',
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
            ingredientes: 'Ingredients',
            estados: {
                'pendiente': 'Pending',
                'preparando': 'Preparing',
                'listo': 'Ready',
                'entregado': 'Delivered',
                'completado': 'Completed'
            }
        }
    };

    const t = textos[idioma];


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
    // Verificar si es admin o empleado al cargar
    const user = JSON.parse(localStorage.getItem('usuario'));
    if (!user || (user.tipo !== 'admin' && user.tipo !== 'empleado')) {
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
        ingredientes: ingredientesSeleccionados,
        centros: centrosSeleccionados
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
    setCentrosSeleccionados(p.centros || ['IES José Zerpa', 'IES Santa Lucía', 'IES El Doctoral']);
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

const handleUpdatePedido = async (pId, nuevoEstado) => {
    try {
        await updatePedidoEstado(pId, nuevoEstado);
        cargarDatos();
    } catch (err) {
        setError("Error al actualizar estado del pedido: " + err.message);
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
                                    {t.inicio}
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    {t.cerrarSesion}
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
                    {usuarioLogged?.tipo === 'admin' && (
                        <button className={`admin-tab-btn ${vista === 'productos' ? 'active-tab' : ''}`} onClick={() => setVista('productos')}>{t.productos}</button>
                    )}
                    <button className={`admin-tab-btn ${vista === 'pedidos' ? 'active-tab' : ''}`} onClick={() => setVista('pedidos')}>{t.pedidos}</button>
                    {usuarioLogged?.tipo === 'admin' && (
                        <button className={`admin-tab-btn ${vista === 'usuarios' ? 'active-tab' : ''}`} onClick={() => setVista('usuarios')}>{t.empleados}</button>
                    )}
                </div>

                {vista === 'productos' && (
                    <div>
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                            <h3 className="mb-0">{t.gestionProductos}</h3>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <label className="text-white-50 small mb-0">{t.filtrarCategoria}</label>
                                <select 
                                    className="form-select form-select-sm bg-dark text-white border-secondary w-auto"
                                    value={filtroCategoria}
                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                >
                                    <option value="todos">{t.todos}</option>
                                    <option value="bebidasCalientes">{t.catBebidasCalientes}</option>
                                    <option value="bebidasFrias">{t.catBebidasFrias}</option>
                                    <option value="golosinas">{t.catGolosinas}</option>
                                    <option value="bocadillos">{t.catBocadillos}</option>
                                </select>
                                <button className="btn btn-success" onClick={() => abrirModalProducto({ nombre: '', precio: 0, descripcion: '', categoria_id: 1, ingredientes: [] })}>{t.nuevoProducto}</button>
                            </div>
                        </div>
                        {/* Vista de Tabla Unificada */}
                        <div className="table-responsive">
                            <table className="table table-dark table-hover align-middle admin-table">
                                <thead>
                                    <tr>
                                        <th>{t.nombre}</th>
                                        <th className="d-none d-sm-table-cell">{t.precio}</th>
                                        <th className="d-none d-md-table-cell">{t.categoria}</th>
                                        <th>{t.estado}</th>
                                        <th>{t.acciones}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos
                                        .filter(p => filtroCategoria === 'todos' || p.categoria === filtroCategoria)
                                        .map(p => (
                                        <tr key={p._id || p.id}>
                                            <td>
                                                <div className="fw-bold product-name-cell">{p.nombre}</div>
                                                <div className="d-sm-none text-warning small">{p.precio}€</div>
                                                <small className="text-white-50 d-none d-lg-block">{p.descripcion?.substring(0, 30)}...</small>
                                            </td>
                                            <td className="d-none d-sm-table-cell">{p.precio}€</td>
                                            <td className="d-none d-md-table-cell"><span className="badge bg-secondary">{p.categoria}</span></td>
                                            <td>{p.activo ? '✅' : '❌'}</td>
                                            <td>
                                                <div className="d-flex gap-1 gap-md-2 flex-wrap">
                                                    <button className="btn btn-sm btn-success action-btn" onClick={() => abrirModalProducto(p)}>{t.editar}</button>
                                                    <button
                                                        className={`btn btn-sm action-btn ${p.activo ? 'btn-outline-warning' : 'btn-success'}`}
                                                        onClick={() => toggleProducto(p)}
                                                    >
                                                        {p.activo ? t.desactivar : t.activar}
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm action-btn ${confirmDeleteId === (p._id || p.id) ? 'btn-danger animate__animated animate__pulse' : 'btn-outline-danger'}`}
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
                    </div>
                )}

                {vista === 'pedidos' && (
                    <div>
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                            <h3 className="mb-0">{t.historialPedidos}</h3>
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
                                    <option value="IES Santa Lucia">IES Santa Lucia</option>
                                    <option value="IES El Doctoral">IES El Doctoral</option>
                                </select>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-dark table-hover admin-table">
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
                                    {pedidos
                                        .filter(p => !filtroCentro || p.centro === filtroCentro)
                                        .map(p => (
                                        <tr key={p._id || p.id}>
                                            <td className="small text-truncate" style={{maxWidth: '100px'}}>#{p._id || p.id}</td>
                                            <td>{p.usuario_nombre}</td>
                                            <td className="small">{new Date(p.fecha).toLocaleString()}</td>
                                            <td>{p.total}€</td>
                                            <td>
                                                <select
                                                    className={`form-select form-select-sm bg-dark text-white border-secondary status-select-${p.estado}`}
                                                    value={p.estado}
                                                    onChange={(e) => handleUpdatePedido(p._id || p.id, e.target.value)}
                                                >
                                                    <option value="pendiente">{t.estados['pendiente']}</option>
                                                    <option value="preparando">{t.estados['preparando']}</option>
                                                    <option value="listo">{t.estados['listo']}</option>
                                                    <option value="entregado">{t.estados['entregado']}</option>
                                                    <option value="cancelado">Cancelado</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {vista === 'usuarios' && (
                    <div>
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                            <h3 className="mb-0">{t.gestionEmpleados}</h3>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm bg-dark text-white border-secondary w-auto"
                                    placeholder={t.buscarUsuario}
                                    value={busquedaUsuario}
                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                />
                                <label className="text-white-50 small mb-0">{t.filtrarRol}</label>
                                <select 
                                    className="form-select form-select-sm bg-dark text-white border-secondary w-auto"
                                    value={filtroRol}
                                    onChange={(e) => setFiltroRol(e.target.value)}
                                >
                                    <option value="todos">{t.todosRoles}</option>
                                    <option value="cliente">{t.cliente}</option>
                                    <option value="empleado">{t.empleado}</option>
                                    <option value="admin">{t.admin}</option>
                                </select>
                                <button className="btn btn-success" onClick={() => setModalUsuario({ nombre: '', correo: '', contrasena: '', tipo: 'cliente' })}>
                                    {t.nuevoEmpleado}
                                </button>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-dark table-hover admin-table">
                                <thead>
                                    <tr>
                                        <th>{t.nombre}</th>
                                        <th className="d-none d-sm-table-cell">{t.correo}</th>
                                        <th>{t.rol}</th>
                                        <th className="d-none d-md-table-cell">{t.turno}</th>
                                        <th>{t.estadoCuenta}</th>
                                        <th>{t.acciones}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios && usuarios
                                        .filter(u => {
                                            const matchesRol = filtroRol === 'todos' || (u.tipo || 'cliente').toLowerCase() === filtroRol.toLowerCase();
                                            const matchesBusqueda = !busquedaUsuario || 
                                                u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) || 
                                                u.correo.toLowerCase().includes(busquedaUsuario.toLowerCase());
                                            return matchesRol && matchesBusqueda;
                                        })
                                        .map(u => (
                                        <tr key={u._id || u.id}>
                                            <td>{u.nombre}</td>
                                            <td className="d-none d-sm-table-cell small">{u.correo}</td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm bg-dark text-white"
                                                    value={u.tipo}
                                                    onChange={(e) => handleUpdateUsuario(u._id || u.id, { tipo: e.target.value, activo: u.activo, turno: u.turno })}
                                                >
                                                    <option value="cliente">{t.cliente}</option>
                                                    <option value="empleado">{t.empleado}</option>
                                                    <option value="admin">{t.admin}</option>
                                                </select>
                                            </td>
                                            <td className="d-none d-md-table-cell text-white-50">
                                                {u.tipo === 'cliente' ? '—' : (
                                                    <select
                                                        className="form-select form-select-sm bg-dark text-white border-secondary"
                                                        defaultValue={u.turno || 'mañana'}
                                                        onChange={(e) => handleUpdateUsuario(u._id || u.id, { tipo: u.tipo, activo: u.activo, turno: e.target.value })}
                                                    >
                                                        <option value="mañana">{t.manyana}</option>
                                                        <option value="tarde">{t.tarde}</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td>{u.activo ? `✅` : `❌`}</td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm action-btn ${u.activo ? 'btn-danger' : 'btn-success'}`}
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

                            <div className="mb-3">
                                <label className="text-info fw-bold">Disponible en Centros:</label>
                                <div className="d-flex flex-wrap gap-3 p-2 border border-secondary rounded bg-dark">
                                    {['IES José Zerpa', 'IES Santa Lucía', 'IES El Doctoral'].map(c => (
                                        <div key={c} className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id={`centro-${c}`}
                                                checked={centrosSeleccionados.includes(c)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCentrosSeleccionados([...centrosSeleccionados, c]);
                                                    } else {
                                                        setCentrosSeleccionados(centrosSeleccionados.filter(name => name !== c));
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label text-white small" htmlFor={`centro-${c}`}>
                                                {c}
                                            </label>
                                        </div>
                                    ))}
                                </div>
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
                                <select 
                                    name="tipo" 
                                    className="form-select" 
                                    defaultValue="cliente"
                                    onChange={(e) => setModalUsuario({...modalUsuario, tipo: e.target.value})}
                                >
                                    <option value="cliente">{t.cliente}</option>
                                    <option value="empleado">{t.empleado}</option>
                                    <option value="admin">{t.admin}</option>
                                </select>
                            </div>
                            {modalUsuario && modalUsuario.tipo !== 'cliente' && (
                                <div className="mb-3">
                                    <label>{t.turno}</label>
                                    <select name="turno" className="form-select" defaultValue="mañana">
                                        <option value="mañana">{t.manyana}</option>
                                        <option value="tarde">{t.tarde}</option>
                                    </select>
                                </div>
                            )}
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
