import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import sgMail from "@sendgrid/mail";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // 👈 Add this to .env

app.use(cors());
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    const scriptURL = process.env.GOOGLE_SCRIPT_URL;
    const bodyData = req.body;

    // 👉 Send to Google Sheet
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });

    const result = await response.text();
    if (!response.ok) {
      return res.status(500).json({ status: "error", message: result });
    }

    // 👉 Send confirmation email to customer
    const msg = {
      to: bodyData.Email,
      from: "contact@maizic.com", // ✅ Use verified sender from SendGrid
      subject: "Maizic Smarthome: Bulk Inquiry Received",
      html: `
        <h2>Hi ${bodyData.Name},</h2>
        <p>Thank you for your interest in bulk purchasing <strong>${bodyData["Product Title"]}</strong>.</p>
        <p>We’ve received your inquiry and our sales team will get back to you shortly.</p>
        <p><strong>Inquiry Summary:</strong></p>
        <ul>
          <li><strong>Quantity:</strong> ${bodyData.Quantity}</li>
          <li><strong>Proposed Price:</strong> ₹${bodyData["Proposed Price"] || "N/A"}</li>
          <li><strong>Message:</strong> ${bodyData.Message || "N/A"}</li>
        </ul>
        <p>For urgent requests, please contact us at support@maizic.com</p>
        <p>Regards,<br>Team Maizic</p>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ status: "success", message: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Google Sheets Proxy Server + Emailer is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
