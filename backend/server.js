// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const Tesseract = require("tesseract.js");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({ apiKey: "sk-FAKE-TEMP-KEY" });

app.use(cors());
app.use(express.json());

app.post("/api/ocr", upload.single("image"), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const result = await Tesseract.recognize(buffer, "eng");
    res.json({ text: result.data.text });
  } catch (err) {
    res.status(500).json({ error: "OCR failed" });
  }
});

app.post("/api/solve", async (req, res) => {
  const { question, subject, username } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: `أنت معلم خبير في مادة ${subject}` },
        { role: "user", content: question }
      ]
    });
    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "AI حل الواجب فشل" });
  }
});

app.listen(port, () => console.log(`🚀 API running on port ${port}`));
