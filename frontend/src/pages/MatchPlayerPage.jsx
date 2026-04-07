import React, { useRef, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import TaskSetPlayer from "./TaskSetPlayer";

const MatchPlayerPage = () => {
  const { matchId } = useParams();
  const location = useLocation();

  const { examId, tasksetId } = location.state || {};
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      `ws://localhost:8000/ws/match/${matchId}/?token=${token}`
    );

    socketRef.current = socket;

    return () => socket.close();
  }, [matchId]);

  const handleAnswered = (taskId, answer, correct) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        action: "answer",
        task_id: taskId,
        correct
      }));
    }
  };

  if (!examId || !tasksetId) {
    return <div>Ошибка запуска матча</div>;
  }

  return (
    <TaskSetPlayer
      forcedTasksetId={tasksetId}
      forcedExamId={examId}
      externalOnAnswered={handleAnswered}
    />
  );
};

export default MatchPlayerPage;