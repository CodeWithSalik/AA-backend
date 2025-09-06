const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config({ path: ".env.local" });


const app = express();
app.use(express.json());

// ✅ Allow only your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend url from .env
  methods: ["POST"]
}));

// 🔑 Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,       // from .env
    pass: process.env.APP_PASSWORD // from .env
  }
});

// 📮 Route: Callback Request
app.post("/send-quote-request", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, message: "Name, Phone, and Email are required." });
    }

    // 📧 Email to YOU (Azad Associates)
    const mailToOwner = {
      from: `"Azad Associates Solar Website" <${process.env.EMAIL}>`,
      to: "ms.azadassociates@gmail.com", // business email
      subject: `📩 New Callback Request from ${name}`,
      html: `
        <h2>New Callback Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Address:</b> ${address || "Not provided"}</p>
        <hr/>
        <p style="color:gray;">This request came from Azad Associates Solar website.</p>
      `
    };

    // 📧 Confirmation Email to Client
    const mailToClient = {
      from: `"Azad Associates Solar" <${process.env.EMAIL}>`,
      to: email,
      subject: "✅ We received your callback request",
      html: `
        <div style="font-family:Georgia, serif; color:#333;">
          <h3>Hi ${name},</h3>
          <p>Thank you for contacting <b>Azad Associates Solar</b>. We’ve received your request and will call you shortly.</p>
          <p>If urgent, please call us directly at <b>+91 9469845424</b>.</p>
          <br/>
          <p>Warm regards,</p>
          <p><b>Team Azad Associates</b><br/>Sopore, J&K 193201</p>
        </div>
      `
    };

    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToClient);

    console.log(`📨 Callback request from ${name} sent successfully.`);
    res.json({ success: true, message: "Thanks! We will contact you shortly." });

  } catch (error) {
    console.error("❌ Callback request error:", error);
    res.status(500).json({ success: false, message: "Failed to send request." });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Solar backend running on port ${PORT}`));
