const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/api/explain", upload.single("image"), async (req, res) => {
  try {
    let text = req.body.text || "";
    const mode = req.body.mode || "idle";

    if (req.file) {
      const result = await Tesseract.recognize(req.file.path, "eng");
      text += "\n" + result.data.text;
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Ты — терпеливый учитель математики.
Если mode = "confused" — объясняй по-другому.
Если mode = "understood" — иди дальше.
Никогда не давай готовый ответ.
`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    res.json({ answer: response.choices[0].message.content });

  } catch (e) {
    console.error(e);
    res.status(500).json({ answer: "Ошибка сервера 😢" });
  }
});

app.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});
