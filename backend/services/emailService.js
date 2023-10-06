import nodemailer from "nodemailer";

export const sendMail = async ({ emailFrom, emailTo, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `easyShare <${emailFrom}>`,
    to: emailTo,
    subject,
    text,
    html,
  });
};
