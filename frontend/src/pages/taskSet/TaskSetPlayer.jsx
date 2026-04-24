import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import TaskItem from "../../components/task/TaskItem";
import "../../static/css/setPlayer.css";

import TaskNavigation from "../../components/taskSetPlayer/TaskNavigation";
import TaskHeader from "../../components/taskSetPlayer/TaskHeader";
import TaskStats from "../../components/taskSetPlayer/TaskStats";
import useExamTimer from "../../components/taskSetPlayer/UseExamTimer";

const TaskSetPlayer = ({
  forcedTasksetId = null,
  forcedExamId = null,
  externalOnAnswered = null,
  matchEnd = null
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const id = forcedTasksetId || params.id;
  const examIdFromUrl = new URLSearchParams(location.search).get("exam");
  const examId = forcedExamId || examIdFromUrl;

  const isExam = Boolean(examId);

  const finishInFlight = useRef(false);
  const retryInFlight = useRef(false);

  const [currentSet, setCurrentSet] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState("playing");

  const [examStartedAt, setExamStartedAt] = useState(null);
  const [examTimeLimit, setExamTimeLimit] = useState(null);
  const [serverScore, setServerScore] = useState(null);

  const timeLeft = useExamTimer(isExam, examStartedAt, examTimeLimit);

  const resetAttemptState = () => {
    setAnswers({});
    setChecked({});
    setTaskIndex(0);
    setScreen("playing");
    setExamStartedAt(null);
    setExamTimeLimit(null);
    setServerScore(null);
  };

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const resp = await api.get(`/taskBank/tasksets/${id}/`);
        const set = resp.data;

        const sorted = [...(set.items || [])].sort((a, b) => a.order - b.order);

        const taskDetails = await Promise.all(
          sorted.map((item) =>
            api.get(`/taskBank/tasks/${item.task}/`).then((r) => ({
              ...r.data,
              _order: item.order,
            }))
          )
        );

        setCurrentSet(set);
        setTasks(taskDetails);
      } catch (e) {
        setError("Не удалось загрузить комплект заданий");
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [id]);

  useEffect(() => {
    if (!isExam) return;

    let cancelled = false;

    const fetchExam = async () => {
      try {
        const resp = await api.get(`/taskBank/exams/${examId}/`);
        if (cancelled) return;

        setExamStartedAt(resp.data?.started_at);
        setExamTimeLimit(resp.data?.time_limit);
        setServerScore(resp.data?.score);

        if (resp.data?.is_finished) {
          setScreen("stats");
        }
      } catch {}
    };

    fetchExam();
    const pollId = setInterval(fetchExam, 15000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [examId, isExam]);

  const finishExam = useCallback(async () => {
    if (!isExam) {
      setScreen("stats");
      return;
    }

    if (finishInFlight.current) return;
    finishInFlight.current = true;

    try {
      const resp = await api.post(`/taskBank/exams/${examId}/finish/`);
      setServerScore(resp.data?.score);
      setScreen("stats");
    } finally {
      finishInFlight.current = false;
    }

    matchEnd()
  }, [examId, isExam]);

  useEffect(() => {
    if (!isExam) return;
    if (timeLeft === null) return;
    if (timeLeft > 0) return;
    finishExam();
  }, [timeLeft, isExam, finishExam]);

  const formatTime = (sec) => {
    if (sec === null || sec === undefined) return "";
    const s = Math.max(0, Number(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(ss)}`;
  };

  const handleAnswered = (taskId, answer, correct) => {
    setAnswers((prev) => ({ ...prev, [taskId]: answer }));
    setChecked((prev) => ({ ...prev, [taskId]: correct }));

    if (externalOnAnswered) {
      externalOnAnswered(taskId, answer, correct, tasks);
    }
  };

  const goTo = (index) => setTaskIndex(index);

  const retry = async () => {
    if (!isExam) {
      resetAttemptState();
      return;
    }

    if (retryInFlight.current) return;
    retryInFlight.current = true;

    try {
      const resp = await api.post(`/taskBank/tasksets/${id}/start-exam/`);
      const nextExamId = resp.data?.exam_id;

      resetAttemptState();

      if (nextExamId) {
        navigate(`/tasksets/play/${id}?exam=${nextExamId}`, { replace: true });
      }
    } finally {
      retryInFlight.current = false;
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  if (screen === "stats") {
    return (
      <TaskStats
        currentSet={currentSet}
        isExam={isExam}
        serverScore={serverScore}
        tasks={tasks}
        checked={checked}
        answers={answers}
        retry={retry}
        navigate={navigate}
      />
    );
  }

  const task = tasks[taskIndex];

  return (
    <div className="task-container">
      <TaskNavigation
        taskIndex={taskIndex}
        tasksLength={tasks.length}
        goTo={goTo}
        finishExam={finishExam}
      />

      <TaskHeader
        task={task}
        currentSet={currentSet}
        isExam={isExam}
        timeLeft={timeLeft}
        formatTime={formatTime}
        taskIndex={taskIndex}
        total={tasks.length}
      />

      {task && (
        <TaskItem
          key={`${examId || "training"}-${task.id}`}
          task={task}
          examSessionId={isExam ? examId : null}
          locked={isExam && answers[task.id] !== undefined}
          disabledByTime={isExam && timeLeft !== null && timeLeft <= 0}
          initialAnswer={answers[task.id] || ""}
          initialCorrect={checked[task.id]}
          onAnswered={handleAnswered}
        />
      )}
    </div>
  );
};

export default TaskSetPlayer;