// Sends email via Brevo's HTTPS API instead of raw SMTP.
//
// Why: Render (aur bohot saare hosts free/basic plan pe) outbound SMTP
// (port 587/465/25) block ya drop kar dete hain — isliye nodemailer
// hang, ENETUNREACH, ya ETIMEDOUT deta tha, chahe Gmail credentials
// bilkul sahi ho. Brevo ka API plain HTTPS (port 443) pe chalta hai,
// jo kabhi block nahi hota, aur custom domain ke bina bhi kaam karta
// hai (bas sender email verify karna padta hai Brevo dashboard me).
export const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "Team Access Control",
        email: process.env.MAIL_USER,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Brevo API error (${response.status}): ${errorBody}`,
    );
  }

  return response.json();
};