import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InicioSesion from './components/InicioSesion';
import Registrarse from './components/Registrarse';
import Inicio from './components/Inicio';
import AdminDashboard from './components/AdminDashboard';
import Pago from './components/Pago';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { getStripeConfig } from './services/api';

const StripeWrapper = ({ children }) => {
  const [stripePromise, setStripePromise] = React.useState(null);

  React.useEffect(() => {
    getStripeConfig().then(res => {
      setStripePromise(loadStripe(res.data.publishableKey));
    });
  }, []);

  if (!stripePromise) return null; // O un cargando...

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<InicioSesion />} />
        <Route path="/register" element={<Registrarse />} />
        <Route path="/home" element={<Inicio />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/pago" element={
          <StripeWrapper>
            <Pago />
          </StripeWrapper>
        } />
      </Routes>
    </React.StrictMode>
  </BrowserRouter>
);

reportWebVitals();