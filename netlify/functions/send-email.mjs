
import nodemailer from "nodemailer";

export default async (request) => {
  // Autoriser uniquement les requêtes POST
  if (request.method !== "POST") {
    return new Response(
      "Method not allowed",
      { status: 405 }
    );
  }

  // Vérifier le jeton de sécurité
  const token = process.env.EMAIL_TEST_TOKEN;
  const authorization = request.headers.get("authorization");

  if (!token || authorization !== `Bearer ${token}`) {
    return new Response(
      "Unauthorized",
      { status: 401 }
    );
  }

  // Récupérer les paramètres Titan depuis Netlify
  const email = process.env.TITAN_EMAIL;
  const password = process.env.TITAN_PASSWORD;
  const host = process.env.TITAN_SMTP_HOST;

  if (!email || !password || !host) {
    return Response.json(
      { success: false, error: "Missing SMTP configuration" },
      { status: 500 }
    );
  }

  try {
    // Connexion au serveur SMTP Titan
    const transporter = nodemailer.createTransport({
      host: host,
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password
      }
    });

    // Envoyer un email de test
    await transporter.sendMail({
      from: email,
      to: email,
      subject: "Test Titan Email - Netlify",
      text: `
Bonjour Christophe,

Félicitations !

Ton site de mariage Nouama & Christophe
peut maintenant envoyer des emails
automatiquement via Titan Email.

Configuration :
- Site : www.nouamachristophe.com
- Hébergement : Netlify
- Messagerie : Titan Email

À bientôt !

Nouama & Christophe
      `
    });

    // Confirmer le succès
    return Response.json({
      success: true,
      message: "Email envoyé avec succès via Titan"
    });

 
} catch (error) {
  console.error("Titan SMTP error:", error.message);

  return Response.json(
    {
      success: false,
      error: "Erreur SMTP Titan",
      code: error.code || "UNKNOWN",
      command: error.command || "UNKNOWN"
    },
    { status: 500 }
  );
}

};

// Adresse de la fonction sur ton site
export const config = {
  path: "/api/send-email"
};
