const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const nodemailer = require("nodemailer");

setGlobalOptions({ maxInstances: 10 });

// SMTP opsætning for Simply.com email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.simply.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
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
      from: "RenPoteService <kontakt@renpoteservice.dk>",
      replyTo: "kontakt@renpoteservice.dk", 
      to: email,
      subject: "Velkommen til RenPoteService! 🐶",
      html: `
        <h2>Hej ${fornavn}!</h2>
        <p>Tak fordi du har tilmeldt dig RenPoteService!</p>
        <p>Vi har registreret din interesse. Når vi rammer 50 tilmeldinger, starter vi servicen og kontakter dig.</p>
        <p><strong>Hvad sker nu:</strong></p>
        <ul>
          <li>Vi kontakter dig på mail når vi er klar</li>
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
