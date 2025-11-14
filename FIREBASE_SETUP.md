# Firebase Setup Guide til RenPoteService — SIMPEL VERSION

Denne guide viser dig hvordan du sætter Firebase op til at gemme tilmeldinger og sende mails.

## Trin 1: Opret Firebase Project

1. Gå til [firebase.google.com](https://firebase.google.com)
2. Log ind med din Google-konto
3. Klik **"Go to console"** og **"Create a project"**
4. Projektnavn: `renpoteservice` (eller hvad du vil)
5. Deaktiver Google Analytics (valgfrit)
6. Klik **"Create project"** og vent på initialisering

## Trin 2: Hent Firebase Config

1. Klik på tandhjulsikonet (⚙️) → **"Project settings"**
2. Scroll ned til **"Your apps"** → klik **"Web"** icon (</>)
3. Kopier hele `firebaseConfig` objektet
4. I `index.html`, find linjen med `const firebaseConfig = {` og erstat hele objektet

Eksempel:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDxxxxxx...",
    authDomain: "renpoteservice.firebaseapp.com",
    projectId: "renpoteservice",
    storageBucket: "renpoteservice.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## Trin 3: Opret Firestore Database

1. I Firebase Console, klik **"Firestore Database"** (venstre menu)
2. Klik **"Create database"**
3. Vælg **"Start in production mode"**
4. Region: **"europe-west1"** (nærmest Danmark)
5. Klik **"Create"**

### Sikkerhedsregler

I Firestore → **Rules** tab, erstat alt med:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /signups/{document=**} {
      allow read, write;
    }
  }
}
```

Klik **"Publish"**

## Trin 4: Installér Firebase CLI

Åbn PowerShell i din projektmappe og kør:

```powershell
npm install -g firebase-tools
firebase login
```

## Trin 5: Opret Cloud Function

Fra projektmappen, kør:

```javascript
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

// Sæt dine Gmail-loginoplysninger her
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

exports.sendWelcomeEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { fornavn, email } = req.body;

      const mailOptions = {
        from: "YOUR_EMAIL@gmail.com",
        to: email,
        subject: "Velkomst til RenPoteService! 🐕",
        html: `
          <h2>Hej ${fornavn}!</h2>
          <p>Tak fordi du har tilmeldt dig RenPoteService!</p>
          <p>Vi har registreret din interesse. Når vi når 50 tilmeldinger, starter vi servicen og kontakter dig.</p>
          <p><strong>Hvad sker nu:</strong></p>
          <ul>
            <li>Vi sender dig SMS når vi er klar</li>
            <li>Aftaler første besøg</li>
            <li>De første 2 gange er helt gratis!</li>
          </ul>
          <p>Spørgsmål? Skriv til: hej@renpoteservice.dk</p>
          <p>Med venlig hilsen,<br>RenPoteService-teamet 🐾</p>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sendt!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});
```

5. I **"package.json"**, tilføj dependencies:

```json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "firebase-functions": "^4.4.1",
    "firebase-admin": "^11.11.1",
    "nodemailer": "^6.9.7",
    "cors": "^2.8.5"
  }
}
```

6. Klik **"Deploy"**

## Trin 5: Sæt Gmail-adgangen op

1. Hvis du bruger Gmail, skal du bruge en **"App Password"** (ikke dit normale password):
   - Gå til [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Vælg **App**: Mail, **Device**: Windows Computer
   - Kopier det 16-tegns password
   - I Cloud Function, erstat `YOUR_APP_PASSWORD` med denne

2. Hvis du bruger en anden email-udbyder (Outlook, etc.), se deres dokumentation

## Trin 6: Hent Cloud Function URL

1. Efter Cloud Function er deployet, find **"Trigger"** fanen
2. Kopier HTTPS-URL'en (ser ud som `https://region-projectid.cloudfunctions.net/sendWelcomeEmail`)
3. I `index.html`, find linjen med `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/sendWelcomeEmail`
4. Erstat med din URL

Eksempel:
```javascript
await fetch('https://europe-west1-renpoteservice.cloudfunctions.net/sendWelcomeEmail', {
```

## Trin 7: Test det hele

1. Åbn `index.html` lokalt
2. Udfyld tilmeldingsformularen
3. Submit
4. Tjek:
   - ✅ Formdata vises i Firebase Firestore (`signupCount` stiger)
   - ✅ Email ankommer til den tilmeldte bruger
   - ✅ Counter opdateres

## Deploy til GitHub Pages

Når det virker lokalt:

```bash
git add .
git commit -m "Firebase integration"
git push origin main
```

GitHub Pages vil hoste siden. Cloud Function og Firestore er backend, så de arbejder uafhængigt.

## Troubleshooting

**Problem: "Firebase error: Missing or insufficient permissions"**
- Tjek dine Security Rules i Firestore (se Trin 3)

**Problem: Email sendes ikke**
- Tjek at Gmail App Password er korrekt
- Tjek Cloud Function logs: Firebase Console → Cloud Functions → Logs

**Problem: Cloud Function URL virker ikke**
- Sikr dig at Cloud Function er "Deployed" (check mark grønt)
- Tjek at HTTPS-URL er korrekt i `index.html`

## Til Produktion (Vigtigt!)

Når du går live:

1. **Sikkerhed**: Ændre Security Rules til at kræve autentifikation
2. **Rate Limiting**: Tilføj spam-protection
3. **Email**: Brug en dedikeret email-service (SendGrid, Mailgun) i stedet for Gmail
4. **GDPR**: Tilføj privatlivspolitik og cookie-banner

---

Spørgsmål? Se [Firebase dokumentation](https://firebase.google.com/docs)
