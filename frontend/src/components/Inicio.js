import React from 'react'
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

/* Import App.css to inherit global styles (Header, Main, Footer, Gradient) */
import '../App.css';
import "./EstiloInicio.css";

import Productos from './Productos';
import Calculos from './CalculosInic';
import Botones from './BotonesInic';

function Inicio() {

    const {
        productosIniciales,
        productos,
        setProductos
    } = Productos();

    const [modoOscuro, setModoOscuro] = useState(false);

    const {
        calcularVentasProducto,
        calcularVentasTotales,
        calcularImpuesto,
        calcularTotalConImpuesto
    } = Calculos({ productos });

    const {
        aumentarCantidad,
        disminuirCantidad,
        reiniciarTodo
    } = Botones({ productos, productosIniciales, setProductos })

    const alternarModo = () => {
        setModoOscuro(!modoOscuro);
    };

    const Dinero = (valor) => {
        return valor + '€';
    };

    const productosConPedidos = productos.filter(p => p.cantidad > 0);
    const hayPedidos = productosConPedidos.length > 0;

    return (
        /* Use the 'App' class to get the main container style */
        <div className="App">

            {/* Standard App Header */}
            <header className="App-header">
                <div className="title">CafES App</div>
                {/* Esto lo voy a dejar asi que no esta funcionando ahora mismo */}
                {/* <button className="btn btn-sm btn-outline-light mt-2" onClick={alternarModo}>
                        {modoOscuro ? '☀️' : '🌑'}
                </button> */}
            </header>

            <main className="App-main">
                <div className="dashboard-container">

                    <div className="row g-4">
                        <div className="col-lg-8">
                            <h2 className="text-white mb-4 border-bottom pb-2">Menú</h2>
                            <div className="row g-3">
                                {productos.map(producto => (
                                    <div className="col-6 col-md-4 col-xl-3" key={producto.id}>
                                        <div className="dash-card">
                                            <div className="icon-wrapper">
                                                {producto.nombre === 'Agua' && '💧'}
                                                {producto.nombre === 'Refresco' && '🥤'}
                                                {producto.nombre === 'Croissant' && '🥐'}
                                                {producto.nombre === 'Ensalada' && '🥗'}
                                                {producto.nombre === 'Hamburguesa' && '🍔'}
                                                {producto.nombre === 'Perrito' && '🌭'}
                                                {producto.nombre === 'Sandwich' && '🥪'}
                                                {producto.nombre === 'Postre' && '🍰'}
                                                {producto.nombre === 'Paquete de papas' && '🍟'}
                                            </div>
                                            <h3 className="item-name">{producto.nombre}</h3>
                                            <div className="item-price">{Dinero(producto.precio)}</div>

                                            <div className="control-group">
                                                <button
                                                    className="btn btn-round"
                                                    onClick={() => disminuirCantidad(producto.id)}
                                                    disabled={producto.cantidad === 0}
                                                >
                                                    -
                                                </button>
                                                <span className="qty-badge">{producto.cantidad}</span>
                                                <button
                                                    className="btn btn-round"
                                                    onClick={() => aumentarCantidad(producto.id)}
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
                                <h2 className="summary-title">Resumen</h2>

                                <div className="flex-grow-1">
                                    {hayPedidos ? (
                                        productosConPedidos.map(producto => (
                                            <div key={producto.id} className="order-item">
                                                <div>
                                                    <span className="fw-bold text-warning me-2">{producto.cantidad}x</span>
                                                    {producto.nombre}
                                                </div>
                                                <div>{Dinero(calcularVentasProducto(producto))}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 text-white-50">
                                            <div className="fs-1 mb-2">🛒</div>
                                            <p>Su pedido está vacío</p>
                                        </div>
                                    )}
                                </div>

                                {hayPedidos && (
                                    <div className="totals-section mt-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Subtotal:</span>
                                            <span>{Dinero(calcularVentasTotales())}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>IGIC (7%):</span>
                                            <span>{Dinero(calcularImpuesto())}</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold fs-5 text-warning border-top pt-2">
                                            <span>Total:</span>
                                            <span>{Dinero(calcularTotalConImpuesto())}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <button
                                        className="btn-confirm"
                                        onClick={() => {
                                            const total = calcularTotalConImpuesto();
                                            if (total > 0) alert('Pedido confirmado. Total: ' + Dinero(total));
                                            else alert('Pedido vacío.');
                                        }}
                                    >
                                        Confirmar
                                    </button>

                                    <button className="btn-clear" onClick={reiniciarTodo}>
                                        Limpiar
                                    </button>

                                    <button
                                        className="btn-exit"
                                        onClick={() => { if (window.confirm('¿Salir?')) window.location.href = '/' }}
                                    >
                                        Salir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Standard App Footer */}
            <footer className="App-footer">
                <div>© IES José Zerpa - Cafetería</div>
            </footer>
        </div>
    )
}

export default Inicio