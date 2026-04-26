import React, { useRef, useState } from "react";
import api from "../../utils/api";
import "../../static/css/match.css";

export default function TestMatchPage() {
  const [messages, setMessages] = useState([]);
  const [matchId, setMatchId] = useState("");
  const socketRef = useRef(null);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const createMatch = async () => {
    try {
      const res = await api.post("/match/create/");
      const newMatchId = res.data.match_id;
      setMatchId(newMatchId);
      addMessage("Матч создан: " + newMatchId);
      connectWebSocket(newMatchId);
    } catch (err) {
      console.error(err);
      addMessage("Ошибка при создании матча");
    }
  };

  const connectWebSocket = (id) => {
    if (socketRef.current) socketRef.current.close();

    const token = localStorage.getItem("access");
    const socket = new WebSocket(`ws://localhost:8000/ws/match/${id}/?token=${token}`);

    socket.onopen = () => addMessage("Подключение установлено для матча " + id);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addMessage("Сервер: " + JSON.stringify(data));
    };
    socket.onclose = () => addMessage("WebSocket отключён");

    socketRef.current = socket;
  };

  const joinMatch = () => {
    if (!socketRef.current) return;
    socketRef.current.send(JSON.stringify({ action: "join" }));
    addMessage("Отправлен запрос на подключение");
  };

  const sendAnswer = () => {
    if (!socketRef.current) return;

    socketRef.current.send(JSON.stringify({
      action: "answer",
      task_id: 1,
      answer: "2"
    }));

    addMessage("Тестовый ответ отправлен");
  };

  return (
    <div className="match-debug-page">
      <section className="match-debug-page__hero">
        <div>
          <span className="match-debug-page__eyebrow text_mini">Техническая страница</span>
          <h1 className="match-debug-page__title text">Проверка WebSocket матча</h1>
          <p className="match-debug-page__description description_text">
            Экран для ручной отладки событий матча без игрового интерфейса.
          </p>
        </div>

        <div className="match-page__hero-badge">
          <span className="text_mini">Активный матч</span>
          <strong>{matchId || "Не выбран"}</strong>
        </div>
      </section>

      <section className="match-debug-page__panel">
        <h2 className="match-debug-page__panel-title text">Подключение и команды</h2>
        <p className="match-debug-page__panel-description description_text">
          Использует те же сокеты и действия, что и основной матчевый режим.
        </p>

        <div className="match-page__form">
          <label className="match-debug-page__field">
            <span className="match-debug-page__label text_mini">ID матча</span>
            <input
              className="match-debug-page__input"
              placeholder="Введите ID матча"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
            />
          </label>

          <div className="match-debug-page__actions">
            <button type="button" className="match-debug-page__button btn_text" onClick={() => connectWebSocket(matchId)}>
              Подключиться
            </button>
            <button type="button" className="match-debug-page__button btn_text" onClick={createMatch}>
              Создать и подключить матч
            </button>
            <button type="button" className="match-page__button-secondary btn_text" onClick={joinMatch}>
              Join
            </button>
            <button type="button" className="match-page__button-secondary btn_text" onClick={sendAnswer}>
              Send answer
            </button>
          </div>
        </div>

        <h3 className="match-debug-page__panel-title text" style={{ marginTop: "28px", marginBottom: "16px", fontSize: "24px" }}>
          Сообщения
        </h3>

        <div className="match-debug-page__messages">
          {messages.length === 0 ? (
            <div className="match-debug-page__message description_text">
              Событий пока нет. После подключения сюда будут записываться ответы сервера.
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="match-debug-page__message description_text">
                {msg}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
