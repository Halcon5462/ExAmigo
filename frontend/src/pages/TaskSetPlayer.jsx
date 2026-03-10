import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import TaskItem from "../components/TaskItem";
import '../static/css/setPlayer.css'

import { ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';

const TaskSetPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentSet, setCurrentSet] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState("playing");

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
          <button className="btn_green" onClick={() => setScreen("stats")}>
            Завершить
          </button>
        )}
      </div>
      <div class="task-info">
        <span>{task.subject} · {currentSet.name}</span>
        <span class="progress"> Задание {taskIndex + 1}/{tasks.length}</span>
      </div>
      {task && (
        <TaskItem
          key={task.id}
          task={task}
          onAnswered={handleAnswered}
        />
      )}
    </div>
  );
};

export default TaskSetPlayer;