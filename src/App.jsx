import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
  };

  const send = async (mode = "idle") => {
  try {
    setAnswer("Думаю... 🤔");

    const formData = new FormData();
    formData.append("text", text);
    formData.append("mode", mode);
    if (image) formData.append("image", image);

    const API = import.meta.env.VITE_API_URL;

    const res = await fetch(`${API}/api/explain`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setAnswer(data.answer);
  } catch (err) {
    console.error(err);
    setAnswer("Ошибка 😕 Попробуй ещё раз");
  }
};
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📘 Учитель математики</h2>

        <textarea
          placeholder="Напиши задачу или вставь текст"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />

        <label style={styles.photoBtn}>
          📷 Сфоткать задачу
          <input type="file" accept="image/*" hidden onChange={handlePhoto} />
        </label>

        <button style={styles.mainBtn} onClick={send}>
          Объясни 🙏
        </button>

        {answer && (
          <div style={styles.answer}>
            {answer}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
             <button
  style={styles.feedbackBtn}
  onClick={() => send("understood")}
>
  Понял 👍
</button>

<button
  style={styles.feedbackBtn}
  onClick={() => send("confused")}
>
  Не понял 😕
</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #4b2a9a, #0a0016)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui"
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 30,
    padding: 22,
    color: "white",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)"
  },

  title: {
    textAlign: "center",
    marginBottom: 18,
    fontSize: 22,
    fontWeight: 700
  },

  textarea: {
    width: "100%",
    height: 120,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.2)",
    padding: 14,
    fontSize: 16,
    outline: "none",
    background: "rgba(0,0,0,0.3)",
    color: "white"
  },

  photoBtn: {
    display: "block",
    textAlign: "center",
    marginTop: 12,
    padding: 13,
    borderRadius: 18,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    fontWeight: 600
  },

  mainBtn: {
    marginTop: 14,
    width: "100%",
    padding: 16,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "white",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(99,102,241,0.6)"
  },

  answer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.2)"
  },

  feedbackBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
    fontWeight: 600
  }
};

