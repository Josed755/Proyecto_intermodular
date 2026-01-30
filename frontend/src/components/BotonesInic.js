const Botones = ({ productos, productosIniciales, setProductos }) => {

    const aumentarCantidad = (id) => {
        
        const nuevosProductos = productos.map(producto => {
            if (producto.id === id) {
                return { ...producto, cantidad: producto.cantidad + 1 };
            }
            return producto;
        });
        setProductos(nuevosProductos);
    };

    const disminuirCantidad = (id) => {

        const nuevosProductos = productos.map(producto => {
            if (producto.id === id && producto.cantidad > 0) {
                return { ...producto, cantidad: producto.cantidad - 1 };
            }
            return producto;
        });
        setProductos(nuevosProductos);
    };

    const reiniciarTodo = () => {
        setProductos(productosIniciales);
    };
    return {
        aumentarCantidad,
        disminuirCantidad,
        reiniciarTodo
    }
}

export default Botones;