import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

/* Import App.css to inherit global styles (Header, Main, Footer, Gradient) */
import '../App.css';
import "./EstiloInicio.css";
import "./EstiloIngredientes.css";

import { useNavigate } from 'react-router-dom';
import Productos from './Productos';
import Calculos from './CalculosInic';
import Botones from './BotonesInic';
import { logout, getUsuario, updatePerfil, setUsuario as setUsuarioLocal, getHistorialPedidos, getIngredientes, getProductoIngredientes } from '../services/api';
import { FaUserCircle, FaHistory, FaSignOutAlt, FaInfoCircle, FaArrowLeft, FaFacebookF, FaInstagram, FaTwitter, FaMapMarkerAlt, FaClock, FaPhoneAlt } from 'react-icons/fa';

function Inicio() {
    const navigate = useNavigate();
    const [cartOpen, setCartOpen] = useState(false);
    const usuario = getUsuario();

    const {
        productosIniciales,
        productos,
        setProductos
    } = Productos();
    const menuRef = useRef(null);

    const [filtro, setFiltro] = useState('todo');
    const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [modalActivo, setModalActivo] = useState(null); // 'perfil', 'historial', 'preferencias', 'ayuda', 'acerca'
    const [productoParaPersonalizar, setProductoParaPersonalizar] = useState(null);
    const [allIngredientes, setAllIngredientes] = useState([]);
    const [isEditingPerfil, setIsEditingPerfil] = useState(false);
    const [tempPerfil, setTempPerfil] = useState({ nombre: usuario?.nombre, centro: usuario?.centro || 'IES José Zerpa' });
    const [historial, setHistorial] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    const getIniciales = (nombre) => {
        if (!nombre) return '?';
        const partes = nombre.trim().split(/\s+/);
        if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
        return partes[0][0].toUpperCase();
    };

    const textos = {
        es: {
            titulo: 'CafES App',
            menu: 'Menú',
            todo: 'Todo',
            bebidasCalientes: 'Bebidas Calientes',
            bebidasFrias: 'Bebidas Frías',
            golosinas: 'Golosinas',
            bocadillos: 'Bocadillos',
            resumen: 'Resumen',
            vacio: 'Su pedido está vacio',
            total: 'Total',
            confirmar: 'Confirmar',
            limpiar: 'Limpiar',
            salir: 'Salir',
            preferencias: 'Preferencias',
            cerrarSesion: 'Cerrar Sesión',
            idioma: 'Idioma',
            espanyol: 'Español',
            ingles: 'Inglés',
            cerrar: 'Cerrar',
            perfil: 'Mi Perfil',
            historial: 'Historial',
            ayuda: 'Ayuda',
            acerca: 'Acerca de',
            ayudaContenido: 'Para realizar un pedido: 1. Elige tus productos del menú. 2. Personaliza los ingredientes si lo deseas. 3. Revisa el resumen de tu pedido. 4. Pulsa "Confirmar" para ir al pago. Recuerda que solo se puede pedir antes de las 08:00 o después de las 14:00 de lunes a viernes. Los fines de semana está disponible todo el día.',
            acercaContenido: 'CafES App v1.0 - Aplicación de gestión de pedidos de cafetería desarrollada para los centros IES José Zerpa, IES Santa Lucia y El Doctoral. Proyecto intermodular DAW/DAM 2026.',
            subtotal: 'Subtotal',
            impuesto: 'IGIC (7%)',
            pedidoConfirmado: 'Pedido confirmado. Total: ',
            confirmarSalir: '¿Estás seguro de que quieres salir?',
            pedidoVacio: 'El pedido está vacío.',
            panelControl: 'Panel de Control',
            centroRecogida: 'Centro de Recogida',
            guardar: 'Guardar',
            editar: 'Editar',
            nombre: 'Nombre',
            historialVacio: 'Aún no has realizado ningún pedido.',
            contacto: 'Contacto: soporte@cafesapp.es',
            cancelar: 'Cancelar',
            guardarCambios: 'Guardar Cambios',
            personaliza: 'Personaliza tus ingredientes',
            usuarioRegistrado: 'USUARIO REGISTRADO',
            ingredientes: 'Ingredientes',
            fueraHorario: 'Fuera de horario. Solo se puede pedir antes de las 08:00 o después de las 14:00 (Lunes a Viernes).',
            cargandoPedidos: 'Cargando pedidos...',
            verCarrito: 'VER CARRITO',
            carritoVacio: 'CARRITO VACÍO',
            menuTitulo: 'Menú',
            estados: {
                'pendiente': 'Pendiente',
                'preparando': 'Preparando',
                'listo': 'Listo',
                'completado': 'Completado'
            }
        },
        en: {
            titulo: 'CafES App',
            menu: 'Menu',
            todo: 'All',
            bebidasCalientes: 'Hot Drinks',
            bebidasFrias: 'Cold Drinks',
            golosinas: 'Snacks',
            bocadillos: 'Sandwiches',
            resumen: 'Summary',
            vacio: 'Your order is empty',
            total: 'Total',
            confirmar: 'Confirm',
            limpiar: 'Clear',
            salir: 'Exit',
            preferencias: 'Preferences',
            cerrarSesion: 'Logout',
            idioma: 'Language',
            espanyol: 'Spanish',
            ingles: 'English',
            cerrar: 'Close',
            perfil: 'Profile',
            historial: 'History',
            ayuda: 'Help',
            acerca: 'About',
            panelControl: 'Admin Panel',
            ayudaContenido: 'To place an order: 1. Choose your products from the menu. 2. Customize ingredients if desired. 3. Review your order summary. 4. Press "Confirm" to proceed to payment. Remember that orders are only available before 08:00 or after 14:00 on weekdays. Weekends are available all day.',
            acercaContenido: 'CafES App v1.0 - Cafeteria order management application developed for IES José Zerpa, IES Santa Lucia and El Doctoral. DAW/DAM intermodular project 2026.',
            subtotal: 'Subtotal',
            impuesto: 'Tax (7%)',
            pedidoConfirmado: 'Order confirmed. Total: ',
            confirmarSalir: 'Are you sure you want to exit?',
            pedidoVacio: 'The order is empty.',
            centroRecogida: 'Collection Point',
            guardar: 'Save',
            editar: 'Edit',
            nombre: 'Name',
            historialVacio: "You haven't made any orders yet.",
            contacto: 'Contact: support@cafesapp.es',
            cancelar: 'Cancel',
            guardarCambios: 'Save Changes',
            personaliza: 'Customize your ingredients',
            usuarioRegistrado: 'REGISTERED USER',
            ingredientes: 'Ingredients',
            fueraHorario: 'Out of hours. Orders are only allowed before 08:00 or after 14:00 (Monday to Friday).',
            nombresProductos: {
                'Agua': ' Water',
                'Refresco': ' Soda',
                'Croissant': ' Croissant',
                'Ensalada': ' Salad',
                'Hamburguesa': ' Burger',
                'Perrito': ' Hot Dog',
                'Sandwich': ' Sandwich',
                'Postre': ' Cake',
                'Paquete de papas': 'Fries'
            },
            cargandoPedidos: 'Loading orders...',
            verCarrito: 'VIEW CART',
            carritoVacio: 'EMPTY CART',
            menuTitulo: 'Menu',
            estados: {
                'pendiente': 'Pending',
                'preparando': 'Preparing',
                'listo': 'Ready',
                'completado': 'Completed'
            }
        }
    };

    const t = textos[idioma];


    const tradNombre = (nombreOriginal) => {
        if (!t.nombresProductos) return nombreOriginal;
        return t.nombresProductos[nombreOriginal] || nombreOriginal;
    };

    const {
        calcularVentasProducto,
        calcularVentasTotales,
        calcularImpuesto,
        calcularTotalConImpuesto
    } = Calculos({ productos, allIngredientes });

    const {
        aumentarCantidad,
        disminuirCantidad,
        reiniciarTodo
    } = Botones({ productos, productosIniciales, setProductos })

    const alergenosProductos = {
        'Bocadillo Un Embutido': 'GLUTEN',
        'Bocadillo Dos Embutidos': 'GLUTEN, SOJA, LECHE',
        'Bocadillo Jamón Serrano': 'GLUTEN, SULFITOS',
        'Bocadillo Tortilla de Papas': 'GLUTEN, HUEVO',
        'Bocadillo de Lomo o Pechuga': 'GLUTEN, SOJA',
        'Bocadillo de Vegetal Atún': 'GLUTEN, PESCADO, SOJA, HUEVO, SULFITOS',
        'Sandwich Mixto': 'GLUTEN, SOJA, LECHE',
        'Sandwich Vegetal + Mixto Triple': 'GLUTEN, PESCADO, SOJA, HUEVO, LECHE, SULFITOS',
        'Croissant Mixto': 'GLUTEN, SOJA, LECHE',
        'Croissant Vegetal': 'GLUTEN, SOJA, PESCADO, HUEVO, SULFITOS'
    };



    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const productosFiltrados = filtro === 'todo'
        ? productos
        : productos.filter(p => p.categoria === filtro);



    const productosConPedidos = productos.filter(p => p.cantidad > 0);
    const hayPedidos = productosConPedidos.length > 0;

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

    useEffect(() => {
        if (modalActivo === 'historial') {
            setCargandoHistorial(true);
            getHistorialPedidos()
                .then(res => {
                    setHistorial(res.data || res);
                    setCargandoHistorial(false);
                })
                .catch(err => {
                    console.error("Error al cargar historial:", err);
                    setCargandoHistorial(false);
                });
        }
    }, [modalActivo]);

    useEffect(() => {
        getIngredientes()
            .then(res => {
                const data = res.data || res;
                if (Array.isArray(data)) {
                    setAllIngredientes(data);
                } else {
                    console.error("Ingredients data is not an array:", data);
                    setAllIngredientes([]);
                }
            })
            .catch(err => {
                console.error("Error fetching ingredients:", err);
                setAllIngredientes([]);
            });
    }, []);

    const abrirModalIngredientes = (producto) => {
        // Solo abrimos el modal si es categoría 3 (Bocadillos) 
        // y NO es un producto de tipo "Extra"
        if (producto.categoria_id !== 3 || producto.nombre.toLowerCase().includes('extra')) {
            aumentarCantidad(producto.id);
            return;
        }

        if (producto.ingredientesPersonalizados && producto.ingredientesPersonalizados.length > 0) {
            setProductoParaPersonalizar({ ...producto });
        } else {
            getProductoIngredientes(producto.id)
                .then(res => {
                    const data = res.data || res;
                    const idsDefault = Array.isArray(data) ? data.map(i => i.id) : [];
                    
                    // Los ingredientes "Extra" deben aparecer desmarcados por defecto
                    const idsSeleccionados = Array.isArray(data) 
                        ? data.filter(i => {
                            const nombre = (i.nombre || '').toLowerCase();
                            const esExtraPan = nombre.includes('extra') && nombre.includes('pan') && nombre.includes('especial');
                            const esExtraQueso = nombre.includes('extra') && nombre.includes('queso');
                            const esExtraTomateLechuga = nombre.includes('extra') && nombre.includes('tomate') && nombre.includes('lechuga');
                            return !esExtraPan && !esExtraQueso && !esExtraTomateLechuga;
                        }).map(i => i.id) 
                        : [];

                    const updatedProducto = {
                        ...producto,
                        defaultIngredientesIds: idsDefault, // Se mantienen todos para que aparezcan en el modal
                        ingredientesPersonalizados: idsSeleccionados // Solo estos aparecen marcados
                    };
                    setProductoParaPersonalizar(updatedProducto);

                    const nuevosProductos = productos.map(p => {
                        if (p.id === producto.id) return updatedProducto;
                        return p;
                    });
                    setProductos(nuevosProductos);
                })
                .catch(err => {
                    console.error("Error default ingredients:", err);
                    setProductoParaPersonalizar({ ...producto });
                });
        }
    };

    const toggleIngrediente = (ingId) => {
        setProductoParaPersonalizar(prev => {
            const currentSelected = prev.ingredientesPersonalizados || [];
            if (currentSelected.includes(ingId)) {
                return { ...prev, ingredientesPersonalizados: currentSelected.filter(id => id !== ingId) };
            } else {
                return { ...prev, ingredientesPersonalizados: [...currentSelected, ingId] };
            }
        });
    };

    const guardarPersonalizacion = () => {
        const nuevosProductos = productos.map(p => {
            if (p.id === productoParaPersonalizar.id) {
                return {
                    ...p,
                    ingredientesPersonalizados: productoParaPersonalizar.ingredientesPersonalizados,
                    cantidad: p.cantidad === 0 ? 1 : p.cantidad // Si es 0, lo ponemos a 1 al personalizar
                };
            }
            return p;
        });
        setProductos(nuevosProductos);
        setProductoParaPersonalizar(null);
    };

    return (
        /* Use the 'App' class to get the main container style */
        <div className="App">

            {/* Standard App Header */}
            <header className="App-header">
                <div className="header-container">
                    <div className="title">{t.titulo}</div>

                    <div className="header-right">
                        <div className="user-menu-wrapper" ref={menuRef}>
                            <div
                                className={`user-profile ${menuAbierto ? 'active' : ''}`}
                                onClick={() => setMenuAbierto(!menuAbierto)}
                            >
                                <div className="user-avatar">{getIniciales(usuario?.nombre)}</div>
                                <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
                                <span className="chevron">▼</span>
                            </div>

                            {menuAbierto && (
                                <div className="user-dropdown shadow-lg">
                                    <button className="dropdown-item" onClick={() => { setModalActivo('perfil'); setMenuAbierto(false); }}>
                                        <span className="item-icon"></span> {t.perfil}
                                    </button>
                                    <button className="dropdown-item" onClick={() => { setModalActivo('historial'); setMenuAbierto(false); }}>
                                        <span className="item-icon"></span> {t.historial}
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={() => { setModalActivo('idioma'); setMenuAbierto(false); }}>
                                        <span className="item-icon"></span> {t.idioma}
                                    </button>
                                    <button className="dropdown-item" onClick={() => { setModalActivo('ayuda'); setMenuAbierto(false); }}>
                                        <span className="item-icon"></span> {t.ayuda}
                                    </button>
                                    <button className="dropdown-item" onClick={() => { setModalActivo('acerca'); setMenuAbierto(false); }}>
                                        <span className="item-icon"></span> {t.acerca}
                                    </button>
                                    {usuario?.tipo === 'admin' && (
                                        <>
                                            <div className="dropdown-divider"></div>
                                            <button className="dropdown-item text-warning" onClick={() => navigate('/admin')}>
                                                <span className="item-icon">⚙️</span> {t.panelControl}
                                            </button>
                                        </>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <span className="item-icon"></span> {t.cerrarSesion}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal de Preferencias y Secciones */}
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

                            {modalActivo === 'perfil' && (
                                <div className="profile-details text-center">
                                    <div className="profile-large-avatar mb-3">{getIniciales(isEditingPerfil ? tempPerfil.nombre : usuario?.nombre)}</div>

                                    {isEditingPerfil ? (
                                        <div className="edit-profile-form text-start">
                                            <div className="mb-3">
                                                <label className="text-white-50 small mb-1">{t.nombre}</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-dark text-white border-secondary"
                                                    value={tempPerfil.nombre}
                                                    onChange={(e) => setTempPerfil({ ...tempPerfil, nombre: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-white-50 small mb-1">{t.centroRecogida}</label>
                                                <select
                                                    className="form-control bg-dark text-white border-secondary"
                                                    value={tempPerfil.centro}
                                                    onChange={(e) => setTempPerfil({ ...tempPerfil, centro: e.target.value })}
                                                >
                                                    <option value="IES José Zerpa">IES José Zerpa</option>
                                                    <option value="IES Santa Lucia">IES Santa Lucia</option>
                                                    <option value="IES El Doctoral">IES El Doctoral</option>
                                                </select>
                                            </div>
                                            <button className="btn-confirm-prefs" onClick={async () => {
                                                try {
                                                    await updatePerfil(usuario.id, tempPerfil);
                                                    const nuevoUsuario = { ...usuario, ...tempPerfil };
                                                    setUsuarioLocal(nuevoUsuario);
                                                    setIsEditingPerfil(false);
                                                } catch (err) {
                                                    alert('Error al actualizar perfil');
                                                }
                                            }}>
                                                {t.guardar}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="mb-1 text-warning">{usuario?.nombre}</h4>
                                            <p className="text-white-50">{usuario?.correo}</p>
                                            <p className="text-info small mb-2">{t.centroRecogida}: {usuario?.centro || 'IES José Zerpa'}</p>
                                            <div className="badge bg-warning text-dark px-3 py-2 mt-2">{t.usuarioRegistrado}</div>
                                            <button className="btn btn-sm btn-outline-warning mt-3 w-100" onClick={() => {
                                                setTempPerfil({ nombre: usuario.nombre, centro: usuario.centro || 'IES José Zerpa' });
                                                setIsEditingPerfil(true);
                                            }}>
                                                {t.editar}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {modalActivo === 'historial' && (
                                <div className="history-list-container">
                                    {cargandoHistorial ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-warning" role="status"></div>
                                            <p className="mt-2 text-white-50">{t.cargandoPedidos}</p>
                                        </div>
                                    ) : historial.length > 0 ? (
                                        <div className="history-items">
                                            {historial.map((pedido, idx) => (
                                                <div key={pedido._id || idx} className="history-card mb-3 p-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="text-warning fw-bold">{new Date(pedido.fecha).toLocaleDateString()}</span>
                                                        <span className="badge bg-dark border border-secondary text-info">
                                                            {t.estados ? (t.estados[pedido.estado?.toLowerCase()] || pedido.estado) : pedido.estado}
                                                        </span>
                                                    </div>
                                                    <div className="history-products small text-white-50">
                                                        {pedido.items.map((item, i) => (
                                                            <div key={i}>• {item.cantidad}x {item.nombre_producto}</div>
                                                        ))}
                                                    </div>
                                                    <div className="text-end mt-2 fw-bold text-white">
                                                        Total: {pedido.total.toFixed(2)}€
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-white-50">
                                            <span className="history-icon" style={{ fontSize: '3rem' }}>🕒</span>
                                            <p className="mt-3">{t.historialVacio}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalActivo === 'ayuda' && (
                                <div className="help-info text-center">
                                    <p>{t.ayudaContenido}</p>
                                    <p className="mt-3 small text-white-50">{t.contacto}</p>
                                </div>
                            )}

                            {modalActivo === 'acerca' && (
                                <div className="text-center">
                                    <h5 className="text-warning">{t.acercaContenido}</h5>
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
                <div className="dashboard-container">

                    <div className="row g-4">
                        <div className="col-lg-8">
                            {/* Filtros de Categoría */}
                            <div className="filter-container mb-4">
                                <button
                                    className={`btn-filter ${filtro === 'todo' ? 'active' : ''}`}
                                    onClick={() => setFiltro('todo')}
                                >
                                    {t.todo}
                                </button>
                                <button
                                    className={`btn-filter ${filtro === 'bebidasCalientes' ? 'active' : ''}`}
                                    onClick={() => setFiltro('bebidasCalientes')}
                                >
                                    {t.bebidasCalientes}
                                </button>
                                <button
                                    className={`btn-filter ${filtro === 'bebidasFrias' ? 'active' : ''}`}
                                    onClick={() => setFiltro('bebidasFrias')}
                                >
                                    {t.bebidasFrias}
                                </button>
                                <button
                                    className={`btn-filter ${filtro === 'golosinas' ? 'active' : ''}`}
                                    onClick={() => setFiltro('golosinas')}
                                >
                                    {t.golosinas}
                                </button>
                                <button
                                    className={`btn-filter ${filtro === 'bocadillos' ? 'active' : ''}`}
                                    onClick={() => setFiltro('bocadillos')}
                                >
                                    {t.bocadillos}
                                </button>
                            </div>

                            <h2 className="text-white mb-4 border-bottom pb-2">{t.menuTitulo}</h2>
                            <div className="row g-3">
                                {productosFiltrados.map(producto => (
                                    <div className="col-12 col-lg-6" key={producto.id}>
                                        <div
                                            className="dash-card"
                                            onClick={() => abrirModalIngredientes(producto)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="icon-wrapper">
                                                {producto.imagen ? (
                                                    <img src={producto.imagen} alt={producto.nombre} className="product-card-img" />
                                                ) : (
                                                    <>
                                                        {producto.nombre.includes('Café') && '☕'}
                                                        {producto.nombre.includes('Infusión') && '🍵'}
                                                        {producto.nombre.includes('Cacao') && '🍫'}
                                                        {producto.nombre.includes('Botella de Agua') && '💧'}
                                                        {producto.nombre.includes('Refresco') && '🥤'}
                                                        {producto.nombre.includes('Zumo') && '🍹'}
                                                        {producto.nombre.includes('Croissant') && '🥐'}
                                                        {producto.nombre.includes('Sandwich') && '🥪'}
                                                        {producto.nombre.includes('Bocadillo') && '🥖'}
                                                        {producto.nombre.includes('Pulgita') && '🥖'}
                                                        {producto.nombre.includes('Papas') && '🍟'}
                                                        {producto.nombre.includes('Galletas') && '🍪'}
                                                        {producto.nombre.includes('Barquillo') && '🧇'}
                                                        {producto.nombre.includes('Caramelos') && '🍬'}
                                                        {producto.nombre.includes('Tortitas') && '🥞'}
                                                        {producto.nombre.includes('Barritas') && '🍫'}
                                                        {!['Café', 'Infusión', 'Cacao', 'Agua', 'Refresco', 'Zumo', 'Croissant', 'Sandwich', 'Bocadillo', 'Pulgita', 'Papas', 'Galletas', 'Barquillo', 'Caramelos', 'Tortitas', 'Barritas'].some(key => producto.nombre.includes(key)) && '🍴'}
                                                    </>
                                                )}
                                            </div>
                                            <h3 className="item-name">{tradNombre(producto.nombre)}</h3>
                                            <div className="item-price">{producto.precio}€</div>

                                            {alergenosProductos[producto.nombre] && (
                                                <div className="allergen-warning">
                                                    ⚠️ ALÉRGENOS: {alergenosProductos[producto.nombre]}
                                                </div>
                                            )}

                                            <div className="control-group">
                                                <button
                                                    className="btn btn-round"
                                                    onClick={(e) => { e.stopPropagation(); disminuirCantidad(producto.id); }}
                                                    disabled={producto.cantidad === 0}
                                                >
                                                    -
                                                </button>
                                                <span className="qty-badge">{producto.cantidad}</span>
                                                <button
                                                    className="btn btn-round"
                                                    onClick={(e) => { e.stopPropagation(); aumentarCantidad(producto.id); }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Summary Panel */}
                        <div className={`col-lg-4 summary-container ${cartOpen ? 'open' : ''}`}>
                            {/* Overlay para cerrar el carrito al tocar fuera en móvil */}
                            {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}></div>}

                            <div className="summary-panel shadow-lg">
                                <div className="summary-header d-lg-none">
                                    <button className="btn-back-cart" onClick={() => setCartOpen(false)}>
                                        <FaArrowLeft />
                                    </button>
                                    <span className="summary-header-title">{t.resumen}</span>
                                    <div style={{ width: '40px' }}></div>
                                </div>

                                <h2 className="summary-title d-none d-lg-block">{t.resumen}</h2>

                                <div className="flex-grow-1">
                                    {hayPedidos ? (
                                        productosConPedidos.map(producto => (
                                            <div key={producto.id} className="order-item flex-wrap">
                                                <div className="d-flex justify-content-between w-100">
                                                    <div>
                                                        <span className="fw-bold text-warning me-2">{producto.cantidad}x</span>
                                                        {tradNombre(producto.nombre)}
                                                    </div>
                                                    <div>{calcularVentasProducto(producto)}€</div>
                                                </div>
                                                {producto.ingredientesPersonalizados && allIngredientes.length > 0 && (
                                                    <div className="ps-4 small text-white-50 w-100">
                                                        {allIngredientes
                                                            .filter(ing => {
                                                                const isSelected = producto.ingredientesPersonalizados.includes(ing.id);
                                                                const isDefault = (producto.defaultIngredientesIds || []).includes(ing.id);
                                                                return (isSelected && !isDefault) || (!isSelected && isDefault);
                                                            })
                                                            .map(ing => {
                                                                const isSelected = producto.ingredientesPersonalizados.includes(ing.id);
                                                                return (
                                                                    <div key={ing.id}>
                                                                        {isSelected ? `+ ${ing.nombre}` : `- No ${ing.nombre}`}
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 text-white-50">
                                            <div className="fs-1 mb-2">🛒</div>
                                            <p>{t.vacio}</p>
                                        </div>
                                    )}
                                </div>

                                {hayPedidos && (
                                    <div className="totals-section mt-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{t.subtotal}:</span>
                                            <span>{parseFloat(calcularVentasTotales()).toFixed(2)}€</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>{t.impuesto}:</span>
                                            <span>{calcularImpuesto()}€</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold fs-5 text-warning border-top pt-2">
                                            <span>{t.total}:</span>
                                            <span>{calcularTotalConImpuesto()}€</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <button
                                        className="btn-confirm"
                                        onClick={() => {
                                            const total = calcularTotalConImpuesto();
                                            if (total > 0) {
                                                const ahora = new Date();
                                                const dia = ahora.getDay();
                                                const hora = ahora.getHours();

                                                // Bloquear de 8 a 13:59 a menos que sea admin o finde (0=Dom, 6=Sab)
                                                if (usuario?.tipo !== 'admin' && dia !== 0 && dia !== 6) {
                                                    if (hora >= 8 && hora < 14) {
                                                        alert(t.fueraHorario);
                                                        return;
                                                    }
                                                }

                                                // Guardar pedido en localStorage para la página de pago
                                                const pedidoParaCheckout = {
                                                    items: productosConPedidos.map(p => ({
                                                        id: p.id,
                                                        nombre: p.nombre,
                                                        cantidad: p.cantidad,
                                                        precio: p.precio,
                                                        ingredientesPersonalizados: p.ingredientesPersonalizados
                                                    })),
                                                    total: total,
                                                    subtotal: calcularVentasTotales(),
                                                    impuesto: calcularImpuesto()
                                                };
                                                localStorage.setItem('carrito', JSON.stringify(pedidoParaCheckout));
                                                navigate('/pago');
                                            } else {
                                                alert(t.pedidoVacio);
                                            }
                                        }}
                                    >
                                        {t.confirmar}
                                    </button>

                                    <button className="btn-clear" onClick={reiniciarTodo}>
                                        {t.limpiar}
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {productoParaPersonalizar && (
                    <div className="ingredients-modal-overlay">
                        <div className="ingredients-modal">
                            <h2>{tradNombre(productoParaPersonalizar.nombre)}</h2>
                            {productoParaPersonalizar.descripcion && (
                                <p className="product-description">{productoParaPersonalizar.description || productoParaPersonalizar.descripcion}</p>
                            )}
                            <p className="text-center text-white-50 mb-4">{t.personaliza}</p>

                            <div className="ingredients-list">
                                {Array.isArray(allIngredientes) && allIngredientes
                                    .filter(ing => productoParaPersonalizar.defaultIngredientesIds?.includes(ing.id))
                                    .map(ing => (
                                        <div
                                            key={ing.id}
                                            className={`ingredient-item ${productoParaPersonalizar.ingredientesPersonalizados.includes(ing.id) ? 'selected' : ''}`}
                                            onClick={() => toggleIngrediente(ing.id)}
                                        >
                                            <div className="ingredient-info">
                                                <span className="ingredient-name">{ing.nombre}</span>
                                                {ing.precio > 0 && <span className="ingredient-price">+{ing.precio}€</span>}
                                            </div>
                                            <div className="ingredient-checkbox"></div>
                                        </div>
                                    ))}
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel-ingredients" onClick={() => setProductoParaPersonalizar(null)}>
                                    {t.cancelar}
                                </button>
                                <button className="btn-save-ingredients" onClick={guardarPersonalizacion}>
                                    {t.guardarCambios}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Standard App Footer */}
            <footer className="App-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>{t.titulo}</h4>
                        <p>IES José Zerpa</p>
                        <p>IES Santa Lucía</p>
                        <p>IES El Doctoral</p>
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
                    <div>© {new Date().getFullYear()} IES José Zerpa - {idioma === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}</div>
                </div>
            </footer>

            {/* BOTÓN FLOTANTE - Solo visible en móvil (d-lg-none) */}
            <div className="cart-floating-wrapper d-lg-none" style={{
                opacity: (!cartOpen && !productoParaPersonalizar) ? 1 : 0,
                pointerEvents: (!cartOpen && !productoParaPersonalizar) ? 'auto' : 'none',
                transform: (!cartOpen && !productoParaPersonalizar) ? 'translateY(0)' : 'translateY(100px)',
                display: 'flex',
                zIndex: 99999,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <button className="cart-floating-pill" onClick={() => setCartOpen(true)}>
                    <div className="cart-pill-left">
                        <span className="cart-pill-count">
                            {productos.reduce((acc, p) => acc + (p.cantidad || 0), 0)}
                        </span>
                    </div>
                    <span className="cart-pill-center">
                        {productos.some(p => (p.cantidad || 0) > 0) ? t.verCarrito : t.carritoVacio}
                    </span>
                    <span className="cart-pill-right">
                        {productos.reduce((acc, p) => acc + ((p.cantidad || 0) * (p.precio || 0)), 0).toFixed(2)}€
                    </span>
                </button>
            </div>
        </div>
    )
}

export default Inicio