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
Ты не учитель и не учебник.
Ты друг, который объясняет математику в чате.

ЖЁСТКИЕ ПРАВИЛА (обязательно):
- максимум 6 строк
- максимум 1 мысль в строке
- не объясняй тему целиком
- объясняй ТОЛЬКО 1 шаг
- всегда спрашивай в конце
- никакой теории
- никаких определений
- никаких списков
- никаких слов "это", "является", "называется"
- без умных слов
- как будто пишешь в телеге

ФОРМАТ:
🙂 объяснение
👇 что сделать
✨ маленький пример
🧠 вопрос

Если пользователь нажал "не понял":
→ объясни в 2 раза проще
→ ещё короче
→ другой пример

Если "понял":
→ следующий шаг (одна строка)
`


        },
        {
  role: "assistant",
  content: "Отвечай коротко и красиво, как в чате."
},
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
