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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // 🔶 Email reçu par toi
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px;">
      <div style="background: white; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h2 style="color: #111827; font-size: 22px;">Nouveau message du formulaire</h2>
        <p><strong>Nom :</strong> ${firstName}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Projet :</strong> ${projectType}</p>
        <p><strong>Budget :</strong> ${budget}</p>
        <p><strong>Délai :</strong> ${timeline}</p>
        <p><strong>Message :</strong><br>${message}</p>
      </div>
    </div>
  `;

  const adminText = `Nom: ${firstName}
Email: ${email}
Projet: ${projectType}
Budget: ${budget}
Délai: ${timeline}
Message: ${message}`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: 'martinbasque.comptes@yahoo.com',
    subject: 'Nouveau message du formulaire',
    replyTo: email,
    text: adminText,
    html: adminHtml
  });

  // 🔷 Email de confirmation client
  const confirmationText = `Bonjour ${firstName || ''},

Merci d'avoir contacté Martin Basque. Votre demande a bien été reçue et nous vous répondrons sous 24h.

—
Thank you for contacting Martin Basque. Your request has been received and we will respond within 24 hours.

À très bientôt / Talk soon,
Martin Basque — Mankind Dev (Paris, France)`;

  const confirmationHtml = `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Confirmation</title>
    <style>
      body { background: #f9fafb; font-family: Arial, sans-serif; padding: 20px; }
      .container { max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #1f2937; }
      .header { display: flex; align-items: center; margin-bottom: 30px; }
      .logo { width: 50px; margin-right: 15px; }
      h1 { font-size: 24px; margin: 0; color: #111827; }
      p { margin: 10px 0; line-height: 1.6; }
      .footer { border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #6b7280; text-align: center; }
      .brand { color: #fbbc04; text-decoration: none; font-weight: bold; }
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
        Merci pour votre message sur notre site web. Nous examinerons votre demande avec attention et,
        si elle correspond à nos critères, nous vous recontacterons très prochainement.
      </p>
      <p>
        Cordialement,<br>
        Martin Basque
      </p>

      <hr>

      <p><strong>Hello ${firstName || ''},</strong></p>
      <p>
        Thank you for your message on our website. We will carefully review your request and,
        if it matches our criteria, we will get back to you shortly.
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
  </html>`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Confirmation de réception de votre demande / Confirmation received',
    replyTo: 'martinbasque.comptes@yahoo.com',
    text: confirmationText,
    html: confirmationHtml
  });

  console.log('Email envoyé à toi et confirmation client OK');
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Email server listening on port ${PORT}`);
});
