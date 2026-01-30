import { useState } from 'react';

const Productos = () => {
    const productosIniciales = [
        { id: 1, nombre: 'Agua', precio: 1.5, cantidad: 0 },
        { id: 2, nombre: 'Refresco', precio: 2.0, cantidad: 0 },
        { id: 3, nombre: 'Croissant', precio: 2.5, cantidad: 0 },
        { id: 4, nombre: 'Ensalada', precio: 3.5, cantidad: 0 },
        { id: 5, nombre: 'Hamburguesa', precio: 3.0, cantidad: 0 },
        { id: 6, nombre: 'Perrito', precio: 2.5, cantidad: 0 },
        { id: 7, nombre: 'Sandwich', precio: 2.5, cantidad: 0 },
        { id: 8, nombre: 'Postre', precio: 3.0, cantidad: 0 },
        { id: 9, nombre: 'Paquete de papas', precio: 1.0, cantidad: 0 }
    ];

    const [productos, setProductos] = useState(productosIniciales);


    return {
        productosIniciales,
        productos,
        setProductos
    }

}

export default Productos