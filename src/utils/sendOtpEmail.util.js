import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendOtpEmail = async (email, name, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });

  const templatePath = path.join(__dirname, "../templates/otp-email.template.ejs");

  const html = await ejs.renderFile(templatePath, { name, otp: otpCode });

  await transporter.sendMail({
    from: `"Your App Name" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Please Verify your account",
    html
  });
};

export default sendOtpEmail;
