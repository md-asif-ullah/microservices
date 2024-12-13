import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: false,
  auth: {
    user: "mdasifullah334@gmail.com",
    pass: "ypzz pdyb awci irfv",
  },
});

export { transporter };
