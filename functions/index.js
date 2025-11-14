const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const nodemailer = require("nodemailer");

setGlobalOptions({ maxInstances: 10 });

// SMTP opsætning for domæne email  
// Vi bruger Gmail SMTP men sender fra dit domæne
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Cloud Function til at sende velkomst-email
exports.sendWelcomeEmail = onCall(async (request) => {
  try {
    const { fornavn, email } = request.data;

    if (!email || !fornavn) {
      throw new Error("Email og fornavn er påkrævet");
    }

    const mailOptions = {
      from: "RenPoteService",
      replyTo: "kontakt@renpoteservice.dk", 
      to: email,
      subject: "Velkommen til RenPoteService! 🐶",
      html: `
        <h2>Hej ${fornavn}!</h2>
        <p>Tak fordi du har tilmeldt dig RenPoteService!</p>
        <p>Vi har registreret din interesse. Når vi rammer 50 tilmeldinger, starter vi servicen og kontakter dig.</p>
        <p><strong>Hvad sker nu:</strong></p>
        <ul>
          <li>Vi sender dig SMS når vi er klar</li>
          <li>Aftaler første besøg</li>
          <li>De første 2 gange er helt gratis!</li>
        </ul>
        <p>Spørgsmål? Skriv til: kontakt@renpoteservice.dk</p>
        <p>Med venlig hilsen,<br>RenPoteService-teamet 🐾</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sendt!" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Fejl ved afsendelse af email: " + error.message);
  }
});
