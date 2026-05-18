import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TaskSetPlayer from "../taskSet/TaskSetPlayer";
import OpponentProgressBar from "../../components/match/OpponentProgressBar";
import MatchResultScreen from "../../components/match/MatchResultScreen";
import "../../static/css/match.css";

const MatchPlayer = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { examId, tasksetId, totalTasks } = location.state || {};

  const socketRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [opponentProgress, setOpponentProgress] = useState({});
  const [myChecked, setMyChecked] = useState({});
  const [screen, setScreen] = useState("playing");

  const myId = JSON.parse(localStorage.getItem("user")).id;

  useEffect(() => {
    if (!examId || !tasksetId || !totalTasks) {
      navigate("/match", { replace: true });
    }
  }, [examId, navigate, tasksetId, totalTasks]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      `ws://${window.location.hostname}:8000/ws/match/${matchId}/?token=${token}`
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
    setAnswers((prev) => ({
      ...prev,
      [taskId]: answer,
    }));
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

    if (myDone) {
      setScreen("waiting");
    }
  }, [myChecked, totalTasks]);

  const myCorrectCount = useMemo(
    () => Object.values(myChecked).filter(Boolean).length,
    [myChecked]
  );

  const opponentAnsweredCount = useMemo(
    () => Object.keys(opponentProgress).length,
    [opponentProgress]
  );

  const opponentCorrectCount = useMemo(
    () => Object.values(opponentProgress).filter(Boolean).length,
    [opponentProgress]
  );

  if (screen === "finished") {
    return (
      <MatchResultScreen
        myChecked={myChecked}
        answers={answers}
        opponentProgress={opponentProgress}
        tasks={tasks}
      />
    );
  }

  if (screen === "waiting") {
    return (
      <div className="match-play-page">
        <section className="match-play-page__waiting">
          <div className="match-play-page__waiting-head">
            <span className="match-play-page__waiting-indicator" />
            <h1 className="match-play-page__waiting-title text">Ожидание соперника</h1>
          </div>

          <p className="match-play-page__waiting-description description_text">
            Вы уже завершили свой набор заданий. Как только второй игрок закончит попытку,
            матч автоматически перейдёт на экран результатов.
          </p>

          <div className="match-play-page__waiting-grid">
            <div className="match-play-page__waiting-card">
              <span className="text_mini">Ваш счёт</span>
              <strong>{myCorrectCount}</strong>
            </div>
            <div className="match-play-page__waiting-card">
              <span className="text_mini">Соперник решил</span>
              <strong>{opponentAnsweredCount} / {totalTasks}</strong>
            </div>
            <div className="match-play-page__waiting-card">
              <span className="text_mini">Верных у соперника</span>
              <strong>{opponentCorrectCount}</strong>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const handleFinishMatch = () => {
    socketRef.current?.send(
      JSON.stringify({ action: "finish" })
    );

    setScreen("waiting");
  };

  return (
    <div className="match-play-page">
      <section className="match-play-page__topbar">
        <div className="match-play-page__topbar-main">
          <span className="match-play-page__match-id text_mini">Матч #{matchId}</span>
          <div className="match-play-page__topbar-stats">
            <span className="match-play-page__topbar-stat text_mini">Ваш прогресс: {Object.keys(myChecked).length} / {totalTasks || tasks.length || 0}</span>
            <span className="match-play-page__topbar-stat text_mini">Верных: {myCorrectCount}</span>
            <span className="match-play-page__topbar-stat text_mini">Соперник решил: {opponentAnsweredCount}</span>
          </div>
        </div>
      </section>

      <div className="match-play-page__board">
        <OpponentProgressBar
          progress={opponentProgress}
          taskIds={tasks.map((task) => task.id)}
          compact
        />
      </div>

      <div className="match-play-page__content">
        <TaskSetPlayer
          forcedTasksetId={tasksetId}
          forcedExamId={examId}
          externalOnAnswered={handleExternalAnswer}
          matchEnd={handleFinishMatch}
        />
      </div>
    </div>
  );
};

export default MatchPlayer;
