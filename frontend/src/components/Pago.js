import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearPedido, getUsuario } from '../services/api';
import './Pago.css';
import '../App.css';

function Pago() {
    const navigate = useNavigate();
    const usuario = getUsuario();
    const [carrito, setCarrito] = useState(null);
    const [metodoPago] = useState('tarjeta');
    const [procesando, setProcesando] = useState(false);
    const [idioma] = useState(localStorage.getItem('idioma') || 'es');

    const [cardData, setCardData] = useState({
        numero: '',
        expiracion: '',
        cvv: '',
        nombre: ''
    });

    const textos = {
        es: {
            titulo: 'Finalizar Pago',
            resumen: 'Resumen del Pedido',
            total: 'Total a Pagar',
            metodo: 'Detalles de la Tarjeta',
            procesar: 'Pagar con Tarjeta',
            procesando: 'Procesando Pago...',
            volver: 'Volver al Menú',
            exito: '¡Pago realizado con éxito! Tu pedido está en marcha.',
            error: 'Error al procesar el pago. Revisa los datos.',
            vacio: 'El carrito está vacío.',
            subtotal: 'Subtotal',
            impuesto: 'IGIC (7%)',
            centro: 'Punto de Recogida',
            numTarjeta: 'Número de Tarjeta',
            fecExp: 'Fecha Expiración (MM/YY)',
            cvv: 'CVV',
            titular: 'Nombre del Titular',
            rellenaCampos: 'Por favor, rellena todos los campos de la tarjeta',
            nombrePlaceholder: 'Juan Pérez'
        },
        en: {
            titulo: 'Checkout',
            resumen: 'Order Summary',
            total: 'Total to Pay',
            metodo: 'Card Details',
            procesar: 'Pay with Card',
            procesando: 'Processing Payment...',
            volver: 'Back to Menu',
            exito: 'Payment successful! Your order is on its way.',
            error: 'Error processing payment. Check your details.',
            vacio: 'Cart is empty.',
            subtotal: 'Subtotal',
            impuesto: 'Tax (7%)',
            centro: 'Collection Point',
            numTarjeta: 'Card Number',
            fecExp: 'Expiry Date (MM/YY)',
            cvv: 'CVV',
            titular: 'Cardholder Name',
            rellenaCampos: 'Please fill all card details',
            nombrePlaceholder: 'John Doe'
        }
    };

    const t = textos[idioma];

    useEffect(() => {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            setCarrito(JSON.parse(carritoGuardado));
        } else {
            navigate('/home');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        if (name === 'expiracion') {
            // Eliminar todo lo que no sea número
            value = value.replace(/\D/g, '');
            
            // Si el primer número es > 1, asumimos que es el mes 0X
            if (value.length === 1 && value > 1) {
                value = '0' + value;
            }
            
            // Insertar la barra después del segundo dígito
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
        }

        if (name === 'numero') {
            // Eliminar todo lo que no sea número
            value = value.replace(/\D/g, '');
            
            // Añadir espacios cada 4 números
            const chunks = value.match(/.{1,4}/g);
            if (chunks) {
                value = chunks.join(' ').substring(0, 19);
            }
        }

        if (name === 'cvv') {
            // Solo números y máximo 3
            value = value.replace(/\D/g, '').substring(0, 3);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = () => {
        // 16 dígitos + 3 espacios = 19
        return cardData.numero.length === 19 &&
            cardData.expiracion.length === 5 &&
            cardData.cvv.length === 3 &&
            cardData.nombre.trim().length > 3;
    };

    const handlePago = async () => {
        if (!carrito || procesando) return;
        if (!isFormValid()) {
            alert(t.rellenaCampos);
            return;
        }

        setProcesando(true);
        try {
            const datosPedido = {
                usuario_id: usuario.id,
                total: carrito.total,
                items: carrito.items,
                metodo_pago: metodoPago,
                centro: usuario.centro || 'IES José Zerpa'
            };

            await crearPedido(datosPedido);
            alert(t.exito);
            localStorage.removeItem('carrito');
            navigate('/home');
        } catch (error) {
            console.error('Error en el pago:', error);
            alert(t.error);
        } finally {
            setProcesando(false);
        }
    };

    if (!carrito) return null;

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-container">
                    <div className="title">CafES App</div>
                </div>
            </header>

            <main className="App-main pago-container">
                <div className="checkout-card shadow-lg">
                    <h2 className="checkout-title">{t.titulo}</h2>

                    <div className="checkout-section">
                        <h3>{t.resumen}</h3>
                        <div className="checkout-items">
                            {carrito.items.map((item, idx) => (
                                <div key={idx} className="checkout-item">
                                    <div className="item-info">
                                        <span className="item-qty">{item.cantidad}x</span>
                                        <span className="item-name">{item.nombre}</span>
                                    </div>
                                    <span className="item-price">{(item.cantidad * item.precio).toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="checkout-divider"></div>

                    <div className="checkout-section">
                        <div className="checkout-totals">
                            <div className="total-row">
                                <span>{t.subtotal}</span>
                                <span>{carrito.subtotal}€</span>
                            </div>
                            <div className="total-row">
                                <span>{t.impuesto}</span>
                                <span>{carrito.impuesto}€</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>{t.total}</span>
                                <span>{carrito.total}€</span>
                            </div>
                        </div>
                    </div>

                    <div className="checkout-section">
                        <h3>{t.metodo}</h3>
                        <div className="card-form">
                            <div className="form-group">
                                <label>{t.titular}</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder={t.nombrePlaceholder}
                                    value={cardData.nombre}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.numTarjeta}</label>
                                <input
                                    type="text"
                                    name="numero"
                                    placeholder="0000 0000 0000 0000"
                                    maxLength="19"
                                    value={cardData.numero}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t.fecExp}</label>
                                    <input
                                        type="text"
                                        name="expiracion"
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        value={cardData.expiracion}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t.cvv}</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        placeholder="***"
                                        maxLength="3"
                                        value={cardData.cvv}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="checkout-section info-section">
                        <p><strong>{t.centro}:</strong> {usuario?.centro || 'IES José Zerpa'}</p>
                    </div>

                    <div className="checkout-actions">
                        <button
                            className="btn-pay"
                            onClick={handlePago}
                            disabled={procesando || !isFormValid()}
                        >
                            {procesando ? t.procesando : t.procesar}
                        </button>
                        <button
                            className="btn-back"
                            onClick={() => navigate('/home')}
                            disabled={procesando}
                        >
                            {t.volver}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="App-footer">
                <div>© IES José Zerpa - Cafetería</div>
            </footer>
        </div>
    );
}

export default Pago;
