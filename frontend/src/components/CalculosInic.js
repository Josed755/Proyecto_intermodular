
const Calculos = ({ productos, allIngredientes }) => {

    // Calcula el total de un producto individualmente
    const calcularVentasProducto = (producto) => {
        let precioExtra = 0;
        if (producto.ingredientesPersonalizados && allIngredientes.length > 0) {
            const defaults = producto.defaultIngredientesIds || [];
            producto.ingredientesPersonalizados.forEach(ingId => {
                // Si el ingrediente NO estaba por defecto, sumamos su precio
                if (!defaults.includes(ingId)) {
                    const ingredient = allIngredientes.find(i => i.id === ingId);
                    if (ingredient) {
                        precioExtra += parseFloat(ingredient.precio || 0);
                    }
                }
            });
        }
        return (producto.cantidad * (parseFloat(producto.precio) + precioExtra)).toFixed(2);
    };

    const calcularVentasTotales = () => {
        let total = 0;
        productos.forEach(producto => {
            total += parseFloat(calcularVentasProducto(producto));
        });
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