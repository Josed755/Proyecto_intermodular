const nodemailer = require('nodemailer');

// Configuración del transportador SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Función para enviar correos electrónicos
const enviarEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"CafES App" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('Correo enviado: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando correo:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { enviarEmail };
