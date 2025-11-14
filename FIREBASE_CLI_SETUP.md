# Firebase Cloud Function Setup — Simpel Guide

Denne guide viser hvordan du installerer Firebase CLI og deployer Cloud Function fra din computer.

## Trin 1: Installér Firebase CLI

Åbn PowerShell i dit projekt og kør:

```powershell
npm install -g firebase-tools
firebase login
```

## Trin 2: Initialize Firebase i dit projekt

Fra projektmappen:

```powershell
firebase init functions
```

Vælg:
- Language: **JavaScript**
- ESLint: **Nej** (bare tryk Enter)
- Dependencies: **Ja**

Dette opretter `functions/` mappe.

## Trin 3: Skriv Cloud Function

I `functions/index.js`, erstat ALLE med:

```javascript
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  try {
    const { fornavn, email } = data;
    await transporter.sendMail({
      from: "YOUR_EMAIL@gmail.com",
      to: email,
      subject: "Velkomst til RenPoteService! 🐕",
      html: `<h2>Hej ${fornavn}!</h2><p>Tak for tilmeldingen!</p>`
    });
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

## Trin 4: Installér dependencies

Fra `functions/` mappen:

```powershell
npm install nodemailer
```

## Trin 5: Sæt Gmail password op

1. Gå til [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Vælg **Mail** + **Windows Computer**
3. Kopier 16-tegns password
4. I `functions/index.js`:
   - Erstat `YOUR_EMAIL@gmail.com` med din email
   - Erstat `YOUR_APP_PASSWORD` med det 16-tegns password

## Trin 6: Deploy Cloud Function

Fra projektmappen:

```powershell
firebase deploy --only functions
```

Når det er færdigt, skal du se en URL:
```
https://REGION-PROJECTID.cloudfunctions.net/sendWelcomeEmail
```

Kopier denne URL.

## Trin 7: Update index.html

I `index.html`, find denne linje:

```javascript
await fetch('https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/sendWelcomeEmail', {
```

Erstat med din URL fra Trin 6.

---

**Det skal nu virke!** Prøv at udfylde formularen og se om email sendes.

Problemer? Se **Troubleshooting** i FIREBASE_SETUP.md
