import { useState } from 'react';

const Productos = () => {
    const productosIniciales = [
        { id: 1, nombre: 'Agua', precio: 1.5, cantidad: 0, categoria: 'bebida', img: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 2, nombre: 'Refresco', precio: 2.0, cantidad: 0, categoria: 'bebida', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 3, nombre: 'Croissant', precio: 2.5, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1555507036-ab1f40388085?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 4, nombre: 'Ensalada', precio: 3.5, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 5, nombre: 'Hamburguesa', precio: 3.0, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 6, nombre: 'Perrito', precio: 2.5, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 7, nombre: 'Sandwich', precio: 2.5, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 8, nombre: 'Postre', precio: 3.0, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1563729768640-d36d4c86a26e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 9, nombre: 'Paquete de papas', precio: 1.0, cantidad: 0, categoria: 'comida', img: 'https://images.unsplash.com/photo-1566478988033-67c9343a4216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
    ];

    const [productos, setProductos] = useState(productosIniciales);


    return {
        productosIniciales,
        productos,
        setProductos
    }

}

export default Productos