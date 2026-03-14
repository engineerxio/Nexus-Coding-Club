import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    console.log(`Received message from ${name} (${email}): ${subject} - ${message}`);

    try {
      // In a real scenario, you would use real SMTP credentials from environment variables
      // For now, we'll log it and simulate success. 
      // If the user provides SMTP_USER and SMTP_PASS, it will actually send.
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'nexuxcodingclub.official@gmail.com',
          pass: process.env.SMTP_PASS // This would need to be an App Password
        }
      });

      const mailOptions = {
        from: email,
        to: 'nexuxcodingclub.official@gmail.com',
        subject: `Nexus Contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      };

      // We only attempt to send if credentials are provided, otherwise we just log success
      if (process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully via SMTP");
      } else {
        console.log("SMTP_PASS not provided. Simulated email sent to nexuxcodingclub.official@gmail.com");
      }

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
