import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import TaskItem from "../components/TaskItem";
import '../static/css/setPlayer.css'

import { ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';

const TaskSetPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const examId = new URLSearchParams(location.search).get("exam");
  const isExam = Boolean(examId);
  const finishInFlight = useRef(false);

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
  const [timeLeft, setTimeLeft] = useState(null);
  const [serverScore, setServerScore] = useState(null);

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
        console.error(e);
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
        setTimeLeft(resp.data?.time_left);
        setServerScore(resp.data?.score);

        if (resp.data?.is_finished) {
          setScreen("stats");
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchExam();
    const pollId = setInterval(fetchExam, 15000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [examId, isExam]);

  useEffect(() => {
    if (!isExam) return;
    if (!examStartedAt || !examTimeLimit) return;

    const startedMs = Date.parse(examStartedAt);

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedMs) / 1000);
      const left = Math.max(0, Number(examTimeLimit) - elapsed);
      setTimeLeft(left);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [examStartedAt, examTimeLimit, isExam]);

  const finishExam = async () => {
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
    } catch (e) {
      console.error(e);
      setScreen("stats");
    } finally {
      finishInFlight.current = false;
    }
  };

  useEffect(() => {
    if (!isExam) return;
    if (timeLeft === null) return;
    if (timeLeft > 0) return;
    finishExam();
  }, [timeLeft, isExam]);

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
    setAnswers((prev) => ({
      ...prev,
      [taskId]: answer,
    }));

    setChecked((prev) => ({
      ...prev,
      [taskId]: correct,
    }));
  };

  const goTo = (index) => {
    setTaskIndex(index);

  };

  const retry = () => {
    setAnswers({});
    setChecked({});
    setTaskIndex(0);
    setScreen("playing");
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  // экран статистики
  if (screen === "stats") {
    const total = tasks.length;
    const correctCount = Object.values(checked).filter(Boolean).length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div style={{ padding: "20px" }}>
        <h2>Результаты: {currentSet?.name}</h2>
        {isExam && (
          <p>
            Итог экзамена (backend): {serverScore ?? correctCount} из {total}
          </p>
        )}
        <p>
          Верных ответов: {correctCount} из {total} ({pct}%)
        </p>

        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>№</th>
              <th>Предмет</th>
              <th>Тип</th>
              <th>Сложность</th>
              <th>Ваш ответ</th>
              <th>Результат</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task, i) => {
              const isCorrect = checked[task.id];
              const userAns = answers[task.id];

              return (
                <tr key={task.id}>
                  <td>{task._order ?? i + 1}</td>
                  <td>{task.subject}</td>
                  <td>{task.type}</td>
                  <td>{task.difficulty}</td>
                  <td>{userAns ?? "—"}</td>
                  <td>
                    {userAns !== undefined
                      ? isCorrect
                        ? "Верно"
                        : "Неверно"
                      : "Не отвечено"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <br />

        <button onClick={retry}>Пройти снова</button>{" "}
        <button onClick={() => navigate("/tasksets")}>
          К списку вариантов
        </button>
      </div>
    );
  }

  const task = tasks[taskIndex];

  return (
    <div className="task-container">
      <div className='set-nav'>
        {taskIndex != 0 &&
          <ArrowLeftCircle 
          className="arrow"
          size={40}
          onClick={() => goTo(taskIndex - 1)} />
        }

        {taskIndex < tasks.length - 1 ? (
            <ArrowRightCircle 
            className="arrow"
            size={40}
            onClick={() => goTo(taskIndex + 1)} />
        ) : (
          <button className="btn_green" onClick={finishExam}>
            Завершить
          </button>
        )}
      </div>
      <div class="task-info">
        <span>
          {task.subject} · {currentSet.name}
          {isExam && timeLeft !== null ? ` · Осталось: ${formatTime(timeLeft)}` : ""}
        </span>
        <span class="progress"> Задание {taskIndex + 1}/{tasks.length}</span>
      </div>
      {task && (
        <TaskItem
          key={task.id}
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
