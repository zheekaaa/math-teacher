const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Groq = require("groq-sdk");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());

/* ===== upload ===== */
const upload = multer({ dest: "uploads/" });

/* ===== groq ===== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* ===== test ===== */
app.get("/test", (req, res) => {
  res.send("ok");
});

/* ===== main ===== */
app.post("/api/explain", upload.single("image"), async (req, res) => {
  try {
    let text = req.body.text || "";
    const mode = req.body.mode || "idle";

    if (mode === "confused") {
      text = "Объясни ещё проще, как для 10-летнего:\n" + text;
    }

    if (mode === "understood") {
      text = "Дай следующий маленький шаг:\n" + text;
    }

    if (req.file) {
      const result = await Tesseract.recognize(req.file.path, "eng");
      text += "\n" + result.data.text;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content: `
Ты — терпеливый учитель, который пишет как в чате.

СТРОГИЕ ПРАВИЛА (обязательны):
- максимум 4 абзаца
- в абзаце максимум 1–2 предложения
- каждая мысль с новой строки
- НИКАКИХ списков
- НИКАКИХ определений
- НИКАКИХ длинных объяснений
- объясняй ТОЛЬКО ОДИН шаг
- не умничай
- не лекция
- не учебник
- пиши как живой человек

ОБЯЗАТЕЛЬНЫЙ ФОРМАТ:
🙂 коротко успокой
👇 что делаем
✨ маленький пример
🧠 вопрос в конце

Если формат нарушен — ответ считается неправильным.
`
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

/* ===== listen ===== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});
