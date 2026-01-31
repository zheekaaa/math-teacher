const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Groq = require("groq-sdk");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("alive");
});


const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.get("/test", (req, res) => {
  res.send("ok");
});

app.post("/api/explain", upload.single("image"), async (req, res) => {
  try {
    let text = req.body.text || "";
    const mode = req.body.mode || "idle";

    if (req.file) {
      const result = await Tesseract.recognize(req.file.path, "eng");
      text += "\n" + result.data.text;
    }

    let systemPrompt = `
Ты — добрый учитель, который объясняет как ChatGPT в чате.

ЖЁСТКИЕ ПРАВИЛА:
- максимум 1 абзац
- в абзаце максимум 2 предложения
- каждая мысль с новой строки
- никаких списков
- никаких определений
- объясняй только ОДИН шаг
- без воды
- используй эмодзи умеренно
- стиль: спокойно, поддерживающе

ФОРМАТ:
🙂 поддержка
👇 действие
✨ пример
🧠 вопрос

Пример:

🙂 Всё нормально, ты не тупишь  
👇 Делим число на 2  
✨ 10 / 2 = 5  
🧠 Попробуешь сам?
`;

    if (mode === "confused") {
      systemPrompt += "\nОбъясни ещё ПРОЩЕ и КОРОЧЕ.";
    }

    if (mode === "understood") {
      systemPrompt += "\nДай следующий шаг, 1 строка.";
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    res.json({
      answer: completion.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Ошибка сервера 😢" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port " + PORT);
});




