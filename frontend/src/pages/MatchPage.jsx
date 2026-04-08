import React, { useState, useRef } from "react";
import api from "../utils/api";

export default function TestMatchPage() {
  const [messages, setMessages] = useState([]);
  const [matchId, setMatchId] = useState("");
  const socketRef = useRef(null);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  // Создать матч через API
  const createMatch = async () => {
    try {
      const res = await api.post("/match/create/");
      const newMatchId = res.data.match_id;
      setMatchId(newMatchId);
      addMessage("Match created with ID: " + newMatchId);
      connectWebSocket(newMatchId);
    } catch (err) {
      console.error(err);
      addMessage("Error creating match");
    }
  };

  // Подключение к WebSocket с JWT из localStorage
  const connectWebSocket = (id) => {
    if (socketRef.current) socketRef.current.close();

    const token = localStorage.getItem("access");
    const socket = new WebSocket(`ws://localhost:8000/ws/match/${id}/?token=${token}`);

    socket.onopen = () => addMessage("Connected to match " + id);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addMessage("Server: " + JSON.stringify(data));
    };
    socket.onclose = () => addMessage("WebSocket disconnected");

    socketRef.current = socket;
  };

  // Отправка "join" на сервер
  const joinMatch = () => {
    if (!socketRef.current) return;
    socketRef.current.send(JSON.stringify({ action: "join" }));
    addMessage("Sent join request");
  };

  const sendAnswer = () => {
    socketRef.current.send(JSON.stringify({
      action: "answer",
      task_id: 1,
      answer: "2"
    }));
};

  return (
    <div style={{ padding: "40px" }}>
      <h1>WebSocket Match Test (JWT)</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Match ID"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
        />
        <button onClick={() => connectWebSocket(matchId)} style={{ marginLeft: 10 }}>
          Connect
        </button>
        <button onClick={createMatch} style={{ marginLeft: 10 }}>
          Create & Connect Match
        </button>
        <button onClick={joinMatch} style={{ marginLeft: 10 }}>
          Join Match
        </button>
        <button onClick={sendAnswer}>Send Answer</button>
      </div>

      <h3>Messages</h3>
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          minHeight: "200px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
}