
const Calculos = ({ productos }) => {


    // Calcula el total de un producto individualmente
    const calcularVentasProducto = (producto) => {
        return (producto.cantidad * producto.precio).toFixed(2);
    };

    const calcularVentasTotales = () => {
        let total = 0;
        // Por cada producto de productos(un for literalmente) multiplica la cantidad por el precio y ese es el total 
        productos.forEach(producto => {
            total += producto.cantidad * producto.precio;
        });
        // toFixed limita los decimales a dos para que no te devuelva un número como pi de largo 
        return total.toFixed(2);
    };

    const calcularImpuesto = () => {
        /*Por algúna razón toFixed tránsforma los números a string en el proceso
          no se porque, pero ahora tengo que usar parseFloat para que lo pase de 
          nuevo a número y poder calcular... 
        */
        const total = parseFloat(calcularVentasTotales());
        return (total * 0.07).toFixed(2);
    };

    const calcularTotalConImpuesto = () => {
        // Aqui sumo el total de impuesto y total real de las ventas
        const ventas = parseFloat(calcularVentasTotales());
        const impuesto = parseFloat(calcularImpuesto());
        return (ventas + impuesto).toFixed(2);
    };
    return {
        calcularVentasProducto,
        calcularVentasTotales,
        calcularImpuesto,
        calcularTotalConImpuesto
    }
}

export default Calculos;