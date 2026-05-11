import { useState, useEffect } from 'react';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [productosIniciales, setProductosIniciales] = useState([]);



    useEffect(() => {
        fetch("https://proyecto-intermodular-pmt1.onrender.com/api/productos")
            .then(res => res.json())
            .then(data => {
                // Añadimos cantidad inicial a cada producto
                const mapCategoria = (nombreCategoria, nombreProd) => {
                    const nombre = nombreProd.toLowerCase();
                    const cat = (nombreCategoria || "").toLowerCase();

                    if (nombre.includes("café") || nombre.includes("infusión") || nombre.includes("cacao") || nombre.includes("descafeinado"))
                        return "bebidasCalientes";

                    if (nombre.includes("agua") || nombre.includes("refresco") || nombre.includes("zumo"))
                        return "bebidasFrias";

                    if (nombre.includes("bocadillo") || nombre.includes("sandwich") || nombre.includes("croissant") || nombre.includes("pulgita"))
                        return "bocadillos";

                    if (nombre.includes("galletas") || nombre.includes("barquillo") || nombre.includes("papas") || nombre.includes("barritas") || nombre.includes("tortitas") || nombre.includes("caramelos"))
                        return "golosinas";

                    return "otro";
                };
                const productosConCantidad = data.map(p => ({
                    ...p,
                    id: p._id, // Mapeamos _id a id para compatibilidad
                    cantidad: 0,
                    categoria: mapCategoria(p.categoria || p.categoria_nombre, p.nombre),
                    categoria_id: p.categoria_id, // Preservamos el ID de categoría para los ingredientes
                    ingredientesPersonalizados: []
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