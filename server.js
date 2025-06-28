require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

app.post('/send-email', async (req, res) => {
  const { firstName, email, projectType, budget, timeline, message } = req.body;

  const now = new Date();
  const locale = 'fr-FR';
  const dateTimeString = now.toLocaleString(locale, {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // 📨 Mail reçu par toi
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 5vw;">
      <div style="background: white; border-radius: 8px; padding: 5vw; max-width: 600px; margin: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <h2 style="color: #111827; font-size: 20px;">Nouvelle demande de développement reçue</h2>
        <p><strong>Date :</strong> ${dateTimeString}</p>
        <p><strong>Nom :</strong> ${firstName}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Projet :</strong> ${projectType}</p>
        <p><strong>Budget :</strong> ${budget}</p>
        <p><strong>Délai :</strong> ${timeline}</p>
        <p><strong>Message :</strong><br>${message}</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: 'martinbasque.comptes@yahoo.com',
    subject: '🔧 Nouvelle demande de développement reçue',
    replyTo: email,
    html: adminHtml
  });

  // 📨 Mail de confirmation client
  const confirmationHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation</title>
      <style>
        body { background: #f9fafb; font-family: Arial, sans-serif; margin: 0; padding: 5vw; }
        .container { width: 100%; max-width: 600px; margin: auto; background: white; padding: 5vw; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #1f2937; box-sizing: border-box; }
        .header { display: flex; align-items: center; margin-bottom: 20px; }
        .logo { width: 50px; margin-right: 12px; }
        h1 { font-size: 22px; margin: 0; color: #111827; }
        p { margin: 10px 0; line-height: 1.6; }
        .footer { border-top: 1px solid #e5e7eb; margin-top: 25px; padding-top: 15px; font-size: 14px; color: #6b7280; text-align: center; }
        .brand { color: #fbbc04; text-decoration: none; font-weight: bold; }
        @media (max-width: 480px) {
          .logo { width: 40px; }
          h1 { font-size: 20px; }
          body, .container { padding: 4vw; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img class="logo" src="https://mankindcorp.fr/wp-content/uploads/2024/09/logo-mankindcorp-mini.png" alt="Mankind Dev">
          <h1>Mankind Dev</h1>
        </div>

        <p><strong>Bonjour ${firstName || ''},</strong></p>
        <p>
          Merci pour votre message sur notre site web.<br>
          Nous avons bien reçu votre demande concernant un projet de site web, le ${dateTimeString}.<br>
          Nous vous recontacterons dans les plus brefs délais.
        </p>
        <p>
          Cordialement,<br>
          Martin Basque
        </p>

        <hr>

        <p><strong>Hello ${firstName || ''},</strong></p>
        <p>
          Thank you for your message on our website.<br>
          We received your request regarding a website project on ${dateTimeString}.<br>
          We will get back to you shortly.
        </p>
        <p>
          Regards,<br>
          Martin Basque
        </p>

        <div class="footer">
          Mankind Dev · Paris – France<br>
          <a href="https://mankindcorp.fr" class="brand">mankindcorp.fr</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: '📬 Confirmation : réception de votre demande de solution web',
    replyTo: 'martinbasque.comptes@yahoo.com',
    html: confirmationHtml
  });

  console.log('📨 Email envoyé à toi et au client');
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur email lancé sur le port ${PORT}`);
});
