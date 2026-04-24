import React, { useState, useRef } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const MatchCreatePage = () => {
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("idle");
    const [joinMatchId, setJoinMatchId] = useState("");
    const [currentMatchId, setCurrentMatchId] = useState(null);

    const socketRef = useRef(null);
    const navigate = useNavigate();

    const connectToMatch = (matchId) => {
        setShowModal(true);
        setStatus("connecting");

        const token = localStorage.getItem("access");

        const socket = new WebSocket(
            `ws://localhost:8000/ws/match/${matchId}/?token=${token}`
        );

        socket.onopen = () => {
            setStatus("waiting");

            socket.send(JSON.stringify({
            action: "join",
            subject: subject || null
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "match_start") {
                const user = JSON.parse(localStorage.getItem("user"));
                const userId = user.id;

                const examData = data.exam_data;

                const examId = examData.players[userId];
                const tasksetId = examData.taskset_id;
                const totalTasks = examData.total_tasks;

                navigate(`/match/play/${matchId}`, {
                    state: { examId, tasksetId, totalTasks}
                });
            }
        };

        socketRef.current = socket;
    };

    const handleCreateMatch = async () => {
        try {
            setLoading(true);

            const matchResp = await api.post("/match/create/", {
                subject: subject
            });
            const matchId = matchResp.data.match_id;
            setCurrentMatchId(matchId);

            //сразу подключаемся как первый игрок
            connectToMatch(matchId);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleJoinMatch = () => {
        if (!joinMatchId) {
            alert("Введите ID матча");
            return;
        }

        connectToMatch(joinMatchId);
    };

    return (
    <div style={{ padding: "20px" }}>
        <h2>Создать матч</h2>

        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Выберите предмет</option>
            <option value="prof_math">Математика</option>
            <option value="russian">Русский</option>
        </select>

        <br /><br />

        <button onClick={handleCreateMatch} disabled={loading}>
            {loading ? "Создание..." : "Создать матч"}
        </button>

        <h3>Подключиться к матчу</h3>

        <input
        type="text"
        placeholder="Введите ID матча"
        value={joinMatchId}
        onChange={(e) => setJoinMatchId(e.target.value)}
        />

        <button onClick={() => handleJoinMatch()}>
        Подключиться
        </button>

      {/* POPUP */}
      {showModal && (
        <div style={modalStyle}>
          <div style={modalContent}>
            <h3>Матч создан</h3>
            <p>ID матча: <b>{currentMatchId}</b></p>
            <p>Скинь его другу 👇</p>

            {status === "connecting" && <p>Подключение...</p>}
            {status === "waiting" && <p>Ожидание соперника...</p>}

            <button onClick={() => setShowModal(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)"
};

const modalContent = {
  background: "white",
  padding: "20px",
  margin: "100px auto",
  width: "300px",
  textAlign: "center"
};

export default MatchCreatePage;