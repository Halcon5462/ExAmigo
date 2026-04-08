import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TaskSetPlayer from "./TaskSetPlayer";

const MatchPlayer = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const { examId, tasksetId, totalTasks } = location.state || {};

  const socketRef = useRef(null);
  const [opponentProgress, setOpponentProgress] = useState({});
  const myId = JSON.parse(localStorage.getItem("user")).id;

  useEffect(() => {
    const token = localStorage.getItem("access");
    const socket = new WebSocket(
      `ws://localhost:8000/ws/match/${matchId}/?token=${token}`
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "progress" && data.user_id !== myId) {
        setOpponentProgress((prev) => ({
          ...prev,
          [data.task_id]: data.correct,
        }));
      }
      console.log("WS:", data);
    };

    socketRef.current = socket;
    return () => socket.close();
  }, [matchId, myId]);

  const handleExternalAnswer = (taskId, answer, correct) => {
    socketRef.current?.send(
      JSON.stringify({ action: "answer", task_id: taskId, correct })
    );
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* Live прогресс соперника */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        {Array.from({ length: totalTasks || 0 }).map((_, i) => {
          const values = Object.values(opponentProgress);
          const isCorrect = values[i];
          return (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                background:
                  isCorrect === undefined ? "#ccc" : isCorrect ? "green" : "red",
              }}
            />
          );
        })}
      </div>

      <TaskSetPlayer
        forcedTasksetId={tasksetId}
        forcedExamId={examId}
        externalOnAnswered={handleExternalAnswer}
      />
    </div>
  );
};

export default MatchPlayer;