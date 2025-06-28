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

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'martinbasque.comptes@yahoo.com',
      subject: 'Nouveau message du formulaire',
      replyTo: email,
      text: `Nom: ${firstName}\nEmail: ${email}\nProjet: ${projectType}\nBudget: ${budget}\nDelai: ${timeline}\nMessage: ${message}`
    });

    const confirmationText = `Bonjour ${firstName || ''},\n\n` +
      "Merci d'avoir contacté Martin Basque. Votre demande a bien été reçue et nous vous répondrons sous 24h.\n\n" +
      "À très bientôt,\nMartin Basque";

    const confirmationHtml = `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Confirmation de réception</title>
        <style>
          body { background:#f8fafc; padding:20px; font-family:Arial, sans-serif; }
          .container { background:#ffffff; border-radius:8px; padding:20px; color:#1f2937; }
          h2 { color:#4f46e5; }
          .footer { margin-top:30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Bonjour ${firstName || ''},</h2>
          <p>Merci d'avoir contacté Martin Basque. Votre demande a bien été reçue et nous vous répondrons sous 24h.</p>
          <p class="footer">À très bientôt,<br/>Martin Basque</p>
        </div>
      </body>
      </html>`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Confirmation de réception de votre demande',
      replyTo: 'martinbasque.comptes@yahoo.com',
      text: confirmationText,
      html: confirmationHtml
    });

    console.log('Email sent to martinbasque.comptes@yahoo.com and confirmation to client');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Email server listening on port ${PORT}`);
});
