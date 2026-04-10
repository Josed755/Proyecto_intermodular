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
import { logout, getUsuario, updatePerfil, setUsuario as setUsuarioLocal } from '../services/api';

function Inicio() {
    const navigate = useNavigate();
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
            comida: 'Comida',
            bebida: 'Bebida',
            resumen: 'Resumen',
            vacio: 'Su pedido está vacío',
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
            ayudaContenido: 'Para realizar un pedido: 1. Elige tus productos. 2. Revisa el resumen. 3. Pulsa "Confirmar".',
            acercaContenido: 'CaffES App v1.0 - IES José Zerpa',
            subtotal: 'Subtotal',
            impuesto: 'IGIC (7%)',
            pedidoConfirmado: 'Pedido confirmado. Total: ',
            confirmarSalir: '¿Estás seguro de que quieres salir?',
            pedidoVacio: 'El pedido está vacío.',
            panelControl: 'Panel de Control',
            centroRecogida: 'Centro de Recogida',
            guardar: 'Guardar',
            editar: 'Editar',
            nombre: 'Nombre'
        },
        en: {
            titulo: 'CafES App',
            menu: 'Menu',
            todo: 'All',
            comida: 'Food',
            bebida: 'Drinks',
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
            ayudaContenido: 'To place an order: 1. Choose your products. 2. Review the summary. 3. Press "Confirm".',
            acercaContenido: 'CaffES App v1.0 - IES José Zerpa',
            subtotal: 'Subtotal',
            impuesto: 'Tax (7%)',
            pedidoConfirmado: 'Order confirmed. Total: ',
            confirmarSalir: 'Are you sure you want to exit?',
            pedidoVacio: 'The order is empty.',
            centroRecogida: 'Collection Point',
            guardar: 'Save',
            editar: 'Edit',
            nombre: 'Name',
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

    const Dinero = (valor) => {
        return valor + '€';
    };

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
        fetch("http://localhost:5000/api/ingredientes")
            .then(res => res.json())
            .then(data => {
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
        // Solo abrir para productos de la categoría 3 (Bocadillos/Sandwiches/Croissants)
        if (producto.categoria_id !== 3) {
            aumentarCantidad(producto.id);
            return;
        }

        // Si ya tiene ingredientes personalizados, los usamos.
        // Si no, cargamos los por defecto.
        if (producto.ingredientesPersonalizados && producto.ingredientesPersonalizados.length > 0) {
            setProductoParaPersonalizar({ ...producto });
        } else {
            fetch(`http://localhost:5000/api/productos/${producto.id}/ingredientes`)
                .then(res => res.json())
                .then(data => {
                    const idsDefault = Array.isArray(data) ? data.map(i => i.id) : [];
                    const updatedProducto = {
                        ...producto,
                        defaultIngredientesIds: idsDefault,
                        ingredientesPersonalizados: idsDefault
                    };
                    setProductoParaPersonalizar(updatedProducto);

                    // También actualizamos el producto en la lista principal para que Calculos lo sepa
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
                                            {t.espanyol} 🇪🇸
                                        </button>
                                        <button className={idioma === 'en' ? 'active' : ''} onClick={() => setIdioma('en')}>
                                            {t.ingles} 🇬🇧
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
                                                    <option value="Centro Ejemplo A">Centro Ejemplo A</option>
                                                    <option value="Centro Ejemplo B">Centro Ejemplo B</option>
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
                                            <div className="badge bg-warning text-dark px-3 py-2 mt-2">USUARIO REGISTRADO</div>
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
                                <div className="text-center py-4 text-white-50">
                                    <span className="history-icon">🕒</span>
                                    <p className="mt-3">Aún no has realizado ningún pedido.</p>
                                </div>
                            )}

                            {modalActivo === 'ayuda' && (
                                <div className="help-info text-center">
                                    <p>{t.ayudaContenido}</p>
                                    <p className="mt-3 small text-white-50">Contacto: soporte@cafesapp.es</p>
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
                                    Todo
                                </button>
                                <button
                                    className={`btn-filter ${filtro === 'comida' ? 'active' : ''}`}
                                    onClick={() => setFiltro('comida')}
                                >
                                    Comida 🍔
                                </button>
                                <button
                                    className={`btn-filter ${filtro === 'bebida' ? 'active' : ''}`}
                                    onClick={() => setFiltro('bebida')}
                                >
                                    Bebida 🥤
                                </button>
                            </div>

                            <h2 className="text-white mb-4 border-bottom pb-2">Menú</h2>
                            <div className="row g-3">
                                {productosFiltrados.map(producto => (
                                    <div className="col-6" key={producto.id}>
                                        <div
                                            className="dash-card"
                                            onClick={() => abrirModalIngredientes(producto)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="icon-wrapper">
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
                                            </div>
                                            <h3 className="item-name">{tradNombre(producto.nombre)}</h3>
                                            <div className="item-price">{Dinero(producto.precio)}</div>

                                            {alergenosProductos[producto.nombre] && (
                                                <div className="allergen-warning">
                                                    ⚠️ ALÉRGENOS: {alergenosProductos[producto.nombre]}
                                                </div>
                                            )}

                                            {producto.categoria_id === 3 && producto.ingredientes && (
                                                <button
                                                    className="btn-ingredientes-verde"
                                                    onClick={(e) => { e.stopPropagation(); abrirModalIngredientes(producto); }}
                                                >
                                                    Ingredientes
                                                </button>
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
                        <div className="col-lg-4">
                            <div className="summary-panel shadow-lg">
                                <h2 className="summary-title">{t.resumen}</h2>

                                <div className="flex-grow-1">
                                    {hayPedidos ? (
                                        productosConPedidos.map(producto => (
                                            <div key={producto.id} className="order-item flex-wrap">
                                                <div className="d-flex justify-content-between w-100">
                                                    <div>
                                                        <span className="fw-bold text-warning me-2">{producto.cantidad}x</span>
                                                        {tradNombre(producto.nombre)}
                                                    </div>
                                                    <div>{Dinero(calcularVentasProducto(producto))}</div>
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
                                            <span>{Dinero(calcularVentasTotales())}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>{t.impuesto}:</span>
                                            <span>{Dinero(calcularImpuesto())}</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold fs-5 text-warning border-top pt-2">
                                            <span>{t.total}:</span>
                                            <span>{Dinero(calcularTotalConImpuesto())}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <button
                                        className="btn-confirm"
                                        onClick={() => {
                                            const total = calcularTotalConImpuesto();
                                            if (total > 0) alert(t.pedidoConfirmado + Dinero(total));
                                            else alert(t.pedidoVacio);
                                        }}
                                    >
                                        {t.confirmar}
                                    </button>

                                    <button className="btn-clear" onClick={reiniciarTodo}>
                                        {t.limpiar}
                                    </button>

                                    <button
                                        className="btn-exit"
                                        onClick={() => { if (window.confirm(t.confirmarSalir)) window.location.href = '/' }}
                                    >
                                        {t.salir}
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
                            <p className="text-center text-white-50 mb-4">Personaliza tus ingredientes</p>

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
                                                {ing.precio > 0 && <span className="ingredient-price">+{Dinero(ing.precio)}</span>}
                                            </div>
                                            <div className="ingredient-checkbox"></div>
                                        </div>
                                    ))}
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel-ingredients" onClick={() => setProductoParaPersonalizar(null)}>
                                    Cancelar
                                </button>
                                <button className="btn-save-ingredients" onClick={guardarPersonalizacion}>
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Standard App Footer */}
            <footer className="App-footer">
                <div>© IES José Zerpa - Cafetería</div>
            </footer>
        </div>
    )
}

export default Inicio