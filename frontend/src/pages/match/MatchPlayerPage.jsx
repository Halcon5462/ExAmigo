import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TaskSetPlayer from "../taskSet/TaskSetPlayer";
import OpponentProgressBar from "../../components/match/OpponentProgressBar";
import MatchResultScreen from "../../components/match/MatchResultScreen";

const MatchPlayer = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const { examId, tasksetId, totalTasks } = location.state || {};

  const socketRef = useRef(null);

  const [taskOrder, setTaskOrder] = useState([]);
  const [tasks, setTasks] = useState([]);

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

      if (data.type === "match_finished") {
        setScreen("finished");
      }
    };

    socketRef.current = socket;
    return () => socket.close();
  }, [matchId, myId]);

  const handleExternalAnswer = (taskId, answer, correct, taskList) => {
    setTasks(taskList);
    setMyChecked((prev) => ({
      ...prev,
      [taskId]: correct,
    }));

    setTaskOrder((prev) => {
      if (prev.includes(taskId)) return prev;
      return [...prev, taskId];
    });

    socketRef.current?.send(
      JSON.stringify({ action: "answer", task_id: taskId, correct })
    );
  };

  useEffect(() => {
    if (!totalTasks) return;

    const myDone = Object.keys(myChecked).length === totalTasks;

    if (myDone) {
      setScreen("waiting");
    }
  }, [myChecked, opponentProgress, totalTasks]);

  if (screen === "finished") {
    return (
      <MatchResultScreen
        myChecked={myChecked}
        opponentProgress={opponentProgress}
        tasks={tasks}
      />
    );
  }

  if (screen === "waiting") {
    return <div>Ожидание соперника...</div>;
  }

  const handleFinishMatch = () => {
    socketRef.current?.send(
      JSON.stringify({ action: "finish" })
    );

    setScreen("waiting");
  };

  return (
    <div style={{ padding: "10px" }}>
      <OpponentProgressBar
        progress={opponentProgress}
        taskIds={tasks.map(t => t.id)}
      />

      <TaskSetPlayer
        forcedTasksetId={tasksetId}
        forcedExamId={examId}
        externalOnAnswered={handleExternalAnswer}
        matchEnd={handleFinishMatch}
      />
    </div>
  );
};

export default MatchPlayer;