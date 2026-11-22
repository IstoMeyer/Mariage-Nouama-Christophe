
import nodemailer from "nodemailer";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  const email = process.env.TITAN_EMAIL;
  const password = process.env.TITAN_PASSWORD;
  const host = process.env.TITAN_SMTP_HOST;

  if (!email || !password || !host) {
    return Response.json(
      { success: false, error: "Missing SMTP configuration" },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const guestEmail = typeof payload.email === "string" ? payload.email.trim() : "";

  if (!message || message.length > 2000) {
    return Response.json(
      { success: false, error: "Le message est requis et doit contenir au maximum 2000 caractères." },
      { status: 400 }
    );
  }

  if (!guestEmail || guestEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    return Response.json(
      { success: false, error: "Adresse email invalide." },
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password
      }
    });

    await transporter.sendMail({
      from: email,
      to: email,
      replyTo: guestEmail,
      subject: "Participation à notre liste de mariage",
      text: `${message}\n\nAdresse email pour répondre : ${guestEmail}`
    });

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
