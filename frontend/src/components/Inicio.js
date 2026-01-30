import React from 'react'
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className={modoOscuro ? 'app-dark' : 'app-light'}>
            <div className="container py-4">

                <header className="app-header rounded p-4 mb-4 text-center">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <h1 className="h4 m-0">
                            Cafetería IES Jose Serpa
                        </h1>

                        <button
                            className="btn btn-outline-light"
                            onClick={alternarModo}
                        >
                            {modoOscuro ? '☀️ Tema Claro' : '🌑 Tema Oscuro'}
                        </button>
                    </div>

                    <p className="mt-2">Gestión de Pedidos Diarios</p>
                </header>

                <div className="row g-">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="h5 border-bottom pb-2 mb-3">
                                    Menú de Productos
                                </h2>

                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>Producto</th>
                                                <th className="text-center">Precio</th>
                                                <th className="text-center">Cantidad</th>
                                                <th className="text-center">Total</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {productos.map(producto => (
                                                <tr key={producto.id}>
                                                    <td>
                                                        {/* Depende del producto que sea le pone un icono ya explique como funciona && en el juego :V */}
                                                        <span className="icono">
                                                            {producto.nombre === 'Agua' && '💧'}
                                                            {producto.nombre === 'Refresco' && '🥤'}
                                                            {producto.nombre === 'Croissant' && '🥐'}
                                                            {producto.nombre === 'Ensalada' && '🥗'}
                                                            {producto.nombre === 'Hamburguesa' && '🍔'}
                                                            {producto.nombre === 'Perrito' && '🌭'}
                                                            {producto.nombre === 'Sandwich' && '🥪'}
                                                            {producto.nombre === 'Postre' && '🍰'}
                                                            {producto.nombre === 'Paquete de papas' && '🍟'}
                                                        </span>
                                                        {producto.nombre}
                                                    </td>

                                                    <td className="text-center">
                                                        {Dinero(producto.precio)}
                                                    </td>

                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className={`btn btn-outline-secondary btn-sm p-3 ${modoOscuro ? 'bg-secondary text-white border-white' : ''}`}
                                                                onClick={() => disminuirCantidad(producto.id)}
                                                                disabled={producto.cantidad === 0}
                                                            >
                                                                -
                                                            </button>

                                                            <span
                                                                className={`d-inline-block text-center btn btn-outline-secondary btn-sm p-3 px-5 ${modoOscuro ? 'bg-secondary text-white border-white' : ''}`}
                                                            >
                                                                {producto.cantidad}
                                                            </span>

                                                            <button
                                                                className={`btn btn-outline-secondary btn-sm p-3 ${modoOscuro ? 'bg-secondary text-white border-white' : ''}`}
                                                                onClick={() => aumentarCantidad(producto.id)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>

                                                    <td className="text-center fw-bold">
                                                        {Dinero(
                                                            calcularVentasProducto(producto)
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">

                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h2 className="h5 border-bottom pb-2 mb-3">
                                    Resumen de Ventas
                                </h2>

                                {hayPedidos ? (
                                    <>
                                        {productosConPedidos.map(producto => (
                                            <div
                                                key={producto.id}
                                                className="d-flex justify-content-between mb-2"
                                            >
                                                <div>
                                                    <strong>
                                                        {producto.cantidad}x {producto.nombre}
                                                    </strong>
                                                    <div className="small text-muted">
                                                        {Dinero(producto.precio)} Precio por unidad
                                                    </div>
                                                </div>

                                                <strong>
                                                    {Dinero(
                                                        calcularVentasProducto(producto)
                                                    )}
                                                </strong>
                                            </div>
                                        ))}

                                        <hr />

                                        <div className="d-flex justify-content-between">
                                            <span>Subtotal</span>
                                            <span>
                                                {Dinero(calcularVentasTotales())}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <span>IGIC (7%)</span>
                                            <span>
                                                {Dinero(calcularImpuesto())}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between fw-bold text-success fs-5 mt-2">
                                            <span>Total</span>
                                            <span>
                                                {Dinero(
                                                    calcularTotalConImpuesto()
                                                )}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="icono-size mb-2">🛒</div>
                                        <p className={`${modoOscuro ? 'text-light' : 'text-dark'}`}>
                                            No hay productos en el pedido
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card shadow-sm">
                            <div className="card-body d-grid gap-3">
                                <button
                                    className="btn btn-success btn-lg"
                                    onClick={() => {
                                        const total = calcularTotalConImpuesto();
                                        if (total > 0) {
                                            alert('Pedido confirmado. Total: ' + Dinero(total));
                                        } else {
                                            alert('El pedido está vacío. No se puede confirmar.');
                                        }
                                    }}
                                >
                                    Aceptar Pedido
                                </button>

                                <button
                                    className="btn btn-warning btn-lg"
                                    onClick={reiniciarTodo}
                                >
                                    Limpiar Todo
                                </button>

                                <button
                                    className="btn btn-outline-danger btn-lg boton-salir"
                                    onClick={() => {
                                        window.confirm(
                                            '¿Está seguro de que desea salir?'
                                        )

                                    }}
                                >
                                    Salir
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/*No sabia que hacer con el footer asi que puse esto, como en las paginas oficiales*/}
                <footer className="app-footer text-center text-muted border-top pt-3 mt-4">
                    <p className={`${modoOscuro ? 'text-light' : 'text-dark'}`}>Sistema de Gestión de Cafetería - IES Lomo de la Herradura</p>
                    <p className={`${modoOscuro ? 'text-light' : 'text-dark'}`}>IGIC 7% aplicado</p>
                </footer>

            </div>
        </div>
  )
}

export default Inicio