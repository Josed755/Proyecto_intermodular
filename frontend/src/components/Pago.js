import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { crearPedido, getUsuario, createPaymentIntent } from '../services/api';
import './Pago.css';
import '../App.css';

function Pago() {
    const navigate = useNavigate();
    const usuario = getUsuario();
    const [carrito, setCarrito] = useState(null);
    const [metodoPago] = useState('tarjeta');
    const [procesando, setProcesando] = useState(false);
    const [idioma] = useState(localStorage.getItem('idioma') || 'es');
    const stripe = useStripe();
    const elements = useElements();

    const stripeOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                },
            },
            invalid: {
                color: '#ff4444',
            },
        },
    };

    const [cardData, setCardData] = useState({
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
            nombrePlaceholder: 'Juan Pérez',
            fueraHorario: 'Fuera de horario. Solo se puede pedir antes de las 08:00 o después de las 14:00 de Lunes a Viernes.'
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
            nombrePlaceholder: 'John Doe',
            fueraHorario: 'Out of hours. Orders are only allowed before 08:00 or after 14:00 (Monday to Friday).'
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
        return cardData.nombre.trim().length > 3;
    };

    const handlePago = async () => {
        if (!carrito || !stripe || !elements || procesando) return;

        const ahora = new Date();
        const dia = ahora.getDay();
        const hora = ahora.getHours();

        if (usuario?.tipo !== 'admin' && dia !== 0 && dia !== 6) {
            if (hora >= 8 && hora < 14) {
                alert(t.fueraHorario);
                return;
            }
        }

        if (!isFormValid()) {
            alert(t.rellenaCampos);
            return;
        }

        setProcesando(true);
        try {
            const { data } = await createPaymentIntent(carrito.total);
            const clientSecret = data.clientSecret;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: cardData.nombre,
                        email: usuario.correo
                    }
                }
            });

            if (result.error) {
                alert(result.error.message);
                setProcesando(false);
                return;
            }

            if (result.paymentIntent.status === 'succeeded') {
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
            }
        } catch (error) {
            console.error('Error en el pago:', error);
            alert(t.error);
        } finally {
            setProcesando(false);
        }
    };

    if (!carrito) return null;

    return (
        <div className="App premium-bg">
            <header className="App-header premium-header">
                <div className="header-container">
                    <div className="title">CafES App</div>
                </div>
            </header>

            <main className="App-main pago-container">
                <div className="checkout-card premium-card">
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
                                    onChange={(e) => setCardData({ ...cardData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.numTarjeta}</label>
                                <div className="stripe-element-container">
                                    <CardNumberElement options={stripeOptions} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t.fecExp}</label>
                                    <div className="stripe-element-container">
                                        <CardExpiryElement options={stripeOptions} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t.cvv}</label>
                                    <div className="stripe-element-container">
                                        <CardCvcElement options={stripeOptions} />
                                    </div>
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
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>CafES App</h4>
                        <p>{idioma === 'es' ? 'Horario de pedidos: L-V antes de las 08:00 o después de las 14:00. Fines de semana disponible todo el día.' : 'Order hours: M-F before 08:00 or after 14:00. Weekends available all day.'}</p>
                    </div>
                    <div className="footer-section">
                        <h4>{idioma === 'es' ? 'Contactos' : 'Contacts'}</h4>
                        <div className="mb-3">
                            <p className="fw-bold mb-0 text-white">IES José Zerpa</p>
                            <p className="small mb-0"><FaPhoneAlt /> 928 75 41 00</p>
                            <p className="small"><FaMapMarkerAlt /> C. Atindana, s/n, 35110 Vecindario</p>
                        </div>
                        <div className="mb-3">
                            <p className="fw-bold mb-0 text-white">IES Santa Lucía</p>
                            <p className="small mb-0"><FaPhoneAlt /> 928 12 50 30</p>
                            <p className="small"><FaMapMarkerAlt /> Avda. de la Unión, 97, 35110 Casa Pastores</p>
                        </div>
                        <div className="mb-0">
                            <p className="fw-bold mb-0 text-white">IES El Doctoral</p>
                            <p className="small mb-0"><FaPhoneAlt /> 928 79 20 13</p>
                            <p className="small"><FaMapMarkerAlt /> C/ Tiscamanita, s/n, 35280 El Doctoral</p>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div>© {new Date().getFullYear()} Canarias Educación - {idioma === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}</div>
                    <div><a href="mailto:josedanielhs755@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>josedanielhs755@gmail.com</a></div>
                </div>
            </footer>
        </div>
    );
}

export default Pago;
