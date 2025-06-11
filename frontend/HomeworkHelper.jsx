import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

// ... rest of the component (already in canvas)
export default function HomeworkHelper() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("general");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [homeworkHistory, setHomeworkHistory] = useState([]);

  const handleLogin = () => {
    if (username.trim()) {
      setLoggedIn(true);
    }
  };

  const handleSolve = async () => {
    setLoading(true);
    setAnswer("");

    try {
      let questionText = question;

      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const ocrRes = await fetch("https://your-backend-url/api/ocr", {
          method: "POST",
          body: formData
        });
        const ocrData = await ocrRes.json();
        questionText = ocrData.text || question;
        setQuestion(questionText);
      }

      const response = await fetch("https://your-backend-url/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, subject, username })
      });
      const data = await response.json();
      setAnswer(data.answer);
      setHomeworkHistory((prev) => [
        { subject, question: questionText, answer: data.answer, timestamp: new Date().toISOString() },
        ...prev
      ]);
    } catch (err) {
      setAnswer("حدث خطأ أثناء الاتصال بالخدمة الذكية. يرجى المحاولة لاحقًا.");
    }

    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const uploaded = e.target.files?.[0];
    setFile(uploaded);
  };

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-20 p-4 text-center">
        <h1 className="text-xl font-bold mb-4">تسجيل الدخول</h1>
        <Input
          type="text"
          placeholder="أدخل اسم المستخدم..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleLogin} className="w-full">دخول</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">مساعد حل الواجبات</h1>
      <p className="mb-4 text-center">مرحبًا، {username} 👋</p>

      <Select value={subject} onValueChange={setSubject} className="mb-4 w-full">
        <SelectItem value="general">اختر المادة</SelectItem>
        <SelectItem value="math">رياضيات</SelectItem>
        <SelectItem value="science">علوم</SelectItem>
        <SelectItem value="arabic">لغة عربية</SelectItem>
        <SelectItem value="coding">برمجة</SelectItem>
      </Select>

      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="اكتب سؤالك هنا..."
        className="mb-4"
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium">أو ارفع صورة للسؤال:</label>
        <Input type="file" accept="image/*" onChange={handleFileUpload} />
      </div>

      <Button onClick={handleSolve} disabled={loading} className="w-full">
        {loading ? "جاري الحل..." : "حل الواجب"}
      </Button>

      {answer && (
        <Card className="mt-6">
          <CardContent className="p-4 whitespace-pre-wrap">{answer}</CardContent>
        </Card>
      )}

      {homeworkHistory.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">📚 واجبات سابقة:</h2>
          <ul className="space-y-2">
            {homeworkHistory.map((item, index) => (
              <li key={index} className="border p-2 rounded shadow">
                <p><strong>🗂️ المادة:</strong> {item.subject}</p>
                <p><strong>❓ السؤال:</strong> {item.question}</p>
                <p><strong>✅ الإجابة:</strong> {item.answer}</p>
                <p className="text-sm text-gray-500">📅 {new Date(item.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
