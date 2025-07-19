import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    const scriptURL = process.env.GOOGLE_SCRIPT_URL;
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.text(); // Not always JSON, sometimes just plain text
    if (!response.ok) {
      return res.status(500).json({ status: "error", message: result });
    }

    res.status(200).json({ status: "success", message: result });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Google Sheets Proxy Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
