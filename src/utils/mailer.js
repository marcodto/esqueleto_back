const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, first_name, code) => {
  await transporter.sendMail({
    from: `"CoachFit" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta de CoachFit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Hola, ${first_name}</h2>
        <p>Gracias por registrarte en <strong>CoachFit</strong>.</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size: 2rem; font-weight: bold; letter-spacing: 8px;
                    background: #f4f4f4; padding: 20px; text-align: center;
                    border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p>Si no creaste esta cuenta, ignora este mensaje.</p>
      </div>
    `,
  });
};