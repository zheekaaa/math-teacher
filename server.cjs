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

/* ===== test route ===== */
app.get("/test", (req, res) => {
  res.send("ok");
});

/* ===== main route ===== */
app.post("/api/explain", upload.single("image"), async (req, res) => {
  try {
    let text = req.body.text || "";
    const mode = req.body.mode || "idle";

if (mode === "confused") {
  text = "Объясни ещё проще, как для 10-летнего:\n" + text;
}

if (mode === "understood") {
  text = "Коротко проверь понимание и задай следующий шаг:\n" + text;
}


    if (req.file) {
      const result = await Tesseract.recognize(req.file.path, "eng");
      text += "\n" + result.data.text;
    }

    const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: `
Ты отвечаешь как ChatGPT в чате.
Коротко, спокойно, по-человечески.

ЖЁСТКИЕ ПРАВИЛА:
- не больше 5 абзацев
- в абзаце максимум 2 предложения
- каждая мысль с новой строки
- никаких длинных объяснений
- никаких списков
- никаких определений
- объясняй только 1 шаг
- используй эмодзи умеренно

ФОРМАТ:
🙂 успокой  
👇 действие  
✨ пример  
🧠 вопрос  

Пример:

🙂 Всё ок  
👇 Делим число на 2  
✨ 10 / 2 = 5  
🧠 Попробуешь?
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
