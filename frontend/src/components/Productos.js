import { useState, useEffect } from 'react';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [productosIniciales, setProductosIniciales] = useState([]);



    useEffect(() => {
        fetch("http://localhost:5000/api/productos")
            .then(res => res.json())
            .then(data => {
                // Añadimos cantidad inicial a cada producto
                const mapCategoria = (nombreCategoria) => {
                    if (!nombreCategoria) return "otro";

                    const nombre = nombreCategoria.toLowerCase();

                    if (nombre.includes("bebida") || nombre.includes("café") || nombre.includes("zumo"))
                        return "bebida";

                    if (nombre.includes("bocadillo") || nombre.includes("sandwich") || nombre.includes("croissant"))
                        return "comida";

                    return "otro";
                };
                const productosConCantidad = data.map(p => ({
                    ...p,
                    cantidad: 0,
                    categoria: mapCategoria(p.categoria_nombre)
                }));

                setProductos(productosConCantidad);
                setProductosIniciales(productosConCantidad);
            })
            .catch(error => console.error("Error cargando productos:", error));
    }, []);



    return {
        productosIniciales,
        productos,
        setProductos
    };
}

export default Productos;