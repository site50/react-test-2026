import { useState, useEffect, useRef } from "react";
import "./App.css";
import React from 'react';


function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Проверяем поддержку браузера
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API не поддерживается этим браузером");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU"; // язык распознавания
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript); // подставляем текст в поле ввода
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Ошибка распознавания:", event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const sendMessage = async () => {
    if (!message) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (data) setReply(data);
      else if (data.error) setReply("Ошибка: " + data.error);
    } catch (err) {
      setReply("Ошибка сети: " + err.message);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="container">
      <h1 className="text">ChatGPT Web App</h1>
      <div className="module-row">
        <input
          type="text"
          className=""
          placeholder="Введите сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={startListening}
                 >
          {listening ? "Говорите..." : "🎤"}
        </button>
      </div>
      <div className="module-row">
     <div className="reply-box">{reply}</div>
     <button
        onClick={sendMessage}
        className="button-send"
        disabled={loading}
      >
        {loading ? "Идёт обработка..." : "Отправить"}
      </button>
      </div>
    </div>
  );
}

export default App;
