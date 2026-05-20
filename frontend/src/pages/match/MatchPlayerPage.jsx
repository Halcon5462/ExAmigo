import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import TaskSetPlayer from "../taskSet/TaskSetPlayer";
import MatchResultScreen from "../../components/match/MatchResultScreen";

import "../../static/css/match.css";

import matchSocketClient from "../../utils/match/matchSocketClient";
import { useMatchStats } from "../../utils/match/matchStats";

import MatchTopBar from "../../components/matchPlayer/MatchTopBar";
import MatchWaiting from "../../components/matchPlayer/MatchWaiting";
import MatchBoard from "../../components/matchPlayer/MatchBoard";

const MatchPlayer = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { examId, tasksetId, totalTasks } = location.state || {};

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
  }, [examId, tasksetId, totalTasks]);

  const socketRef = matchSocketClient(matchId, myId, (data) => {
    if (data.type === "progress" && data.user_id !== myId) {
      setOpponentProgress((prev) => ({
        ...prev,
        [data.task_id]: data.correct,
      }));
    }

    if (data.type === "match_finished") {
      setScreen("finished");
    }
  });

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
      JSON.stringify({
        action: "answer",
        task_id: taskId,
        correct,
      })
    );
  };

  useEffect(() => {
    if (!totalTasks) return;

    if (Object.keys(myChecked).length === totalTasks) {
      setScreen("waiting");
    }
  }, [myChecked, totalTasks]);

  const {
    myCorrectCount,
    opponentAnsweredCount,
    opponentCorrectCount,
  } = useMatchStats(myChecked, opponentProgress);

  const handleFinishMatch = () => {
    socketRef.current?.send(JSON.stringify({ action: "finish" }));
    setScreen("waiting");
  };

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
      <MatchWaiting
        myCorrectCount={myCorrectCount}
        opponentAnsweredCount={opponentAnsweredCount}
        opponentCorrectCount={opponentCorrectCount}
        totalTasks={totalTasks}
      />
    );
  }

  return (
    <div className="match-play-page">
      <MatchTopBar
        matchId={matchId}
        myChecked={myChecked}
        totalTasks={totalTasks}
        tasksLength={tasks.length}
        myCorrectCount={myCorrectCount}
        opponentAnsweredCount={opponentAnsweredCount}
      />

      <MatchBoard
        opponentProgress={opponentProgress}
        tasks={tasks}
      />

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
