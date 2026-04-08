import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TaskSetPlayer from "./TaskSetPlayer";
import OpponentProgressBar from "../components/match/OpponentProgressBar";
import MatchResultScreen from "../components/match/MatchResultScreen";

const MatchPlayer = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const { examId, tasksetId, totalTasks } = location.state || {};

  const socketRef = useRef(null);

  const [opponentProgress, setOpponentProgress] = useState({});
  const [myChecked, setMyChecked] = useState({});
  const [screen, setScreen] = useState("playing");

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
    };

    socketRef.current = socket;
    return () => socket.close();
  }, [matchId, myId]);

  const handleExternalAnswer = (taskId, answer, correct) => {
    setMyChecked((prev) => ({
      ...prev,
      [taskId]: correct,
    }));

    socketRef.current?.send(
      JSON.stringify({ action: "answer", task_id: taskId, correct })
    );
  };

  useEffect(() => {
    if (!totalTasks) return;

    const myDone = Object.keys(myChecked).length === totalTasks;
    const oppDone = Object.keys(opponentProgress).length === totalTasks;

    if (myDone && oppDone) {
      setScreen("finished");
    }
  }, [myChecked, opponentProgress, totalTasks]);

  if (screen === "finished") {
    return (
      <MatchResultScreen
        myChecked={myChecked}
        opponentProgress={opponentProgress}
        totalTasks={totalTasks}
      />
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      <OpponentProgressBar
        progress={opponentProgress}
        totalTasks={totalTasks}
      />

      <TaskSetPlayer
        forcedTasksetId={tasksetId}
        forcedExamId={examId}
        externalOnAnswered={handleExternalAnswer}
      />
    </div>
  );
};

export default MatchPlayer;