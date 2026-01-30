import { useState, useEffect, useRef } from "react";
import "./App.css";
import React from 'react';
import { FaMessage } from "react-icons/fa6";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("Введите сообщение");

  const recognitionRef = useRef(null);
  const loadingTexts = [
    "loading.",
    "loading..",
    "loading...",
  ];

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
    };

    recognition.onerror = (event) => {
      //console.error("Ошибка распознавания:", event.error);
    };

    //   recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    if (!loading) {
      setPlaceholder("enter question");
      console.log(`отправлено на back-end`)
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(loadingTexts[i % loadingTexts.length]);
      i++;
    }, 500);

    return () => clearInterval(interval);
    // console.log(loading)
  }, [loading]);

  const startListening = () => {
    if (recognitionRef.current) {
      setLoading(true);
      recognitionRef.current.start();
      console.log(`start!`)
    }
  };

  const sendMessage = async () => {
    if (!message) return;

    setLoading(false);
    setReply("");
    setMessage("");

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
      <div className="container-message">
        <FaMessage style={{ fontSize: '0.8rem', color: '#edf0f9' }} />
      </div>
      <h2 className="answer">
        {loading ?
          <span style={{ color: `white` }}>
            <i className="fa fa-spinner fa-spin" ></i>
          </span>
          :
          reply}
      </h2>
      <h2 className="text">Hi there!</h2>
      <h1 className="text">What would you like to know?</h1>
      <p >Use one of the most common promp ts below  </p>
      <p >or ask your own question  </p>
      <div className="module-row">

        {loading ?
          <div className="input-container">
            <input
              type="text"
              placeholder={placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field red"
            />
            <i className="fa fa-microphone" onClick={startListening} ></i>
            <div
              onClick={sendMessage}
              className="button-send red-send"
             
            >
              <i className="arrow right "
                style={loading ? { border: "solid #2a5385 ", borderWidth: "0 3px 3px 0" } : {}}
              ></i>
            </div>
          </div>
          :
          <div className="input-container">
            <input
              type="text"
              placeholder="Ask whatever you want "
              value={``}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field "
            />
            <i
              className="fa fa-microphone"
              style={loading ? {} : { color: `#2a5385` }}
              onClick={startListening} ></i>
            <div
              onClick={sendMessage}
              className="button-send "
            ><i className="arrow right"></i></div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
