import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import TaskItem from "../components/TaskItem";
import '../static/css/taskset.css';

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

  if (loading) return <div className="text_mini">Загрузка...</div>;
  if (error) return <div className="text_mini">{error}</div>;

  if (screen === "stats") {
    const total = tasks.length;
    const correctCount = Object.values(checked).filter(Boolean).length;
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="results-stats">
        <h1 className="results-stats_title text">Результаты: {currentSet?.name}</h1>

        <div className="results-stats_score">
          <div className="results-stats_score-value">{percent}%</div>
          <div className="description_text">
            Верных ответов: {correctCount} из {total} ({percent}%)
          </div>
        </div>

        <table className="results-stats_table">
          <thead>
            <tr className="description_text">
              <th>#</th>
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
                <tr key={task.id} className="description_text">
                  <td>{task._order ?? i + 1}</td>
                  <td>{task.subject}</td>
                  <td>{task.type}</td>
                  <td>{task.difficulty}</td>
                  <td>{userAns ?? "—"}</td>
                  <td className={isCorrect ? 'results-stats_correct' : 'results-stats_incorrect'}>
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

        <div className="results-stats_buttons">
          <button className="results-stats_btn-retry btn_text" onClick={retry}>
            Пройти снова
          </button>
          <button className="results-stats_btn-list btn_text" onClick={() => navigate("/tasksets")}>
            К списку вариантов
          </button>
        </div>
      </div>
    );
  }

  const task = tasks[taskIndex];

  return (
    <div className="task-player">
      <div className="task-player_header">
        <h2 className="text">{currentSet?.name}</h2>
        <div className="task-player_progress description_text">
          Задание {taskIndex + 1} из {tasks.length}
        </div>
      </div>

      <div className="task-player_card">
        {task && (
          <TaskItem
            key={task.id}
            task={task}
            onAnswered={handleAnswered}
          />
        )}
      </div>

      <div className="task-player_buttons">
        {taskIndex > 0 && (
          <button
            className="task-player_btn-back btn_text"
            onClick={() => goTo(taskIndex - 1)}
          >
            ← Назад
          </button>
        )}

        {taskIndex < tasks.length - 1 ? (
          <button
            className="task-player_btn-next btn_text"
            onClick={() => goTo(taskIndex + 1)}
          >
            Далее →
          </button>
        ) : (
          <button
            className="task-player_btn-next btn_green"
            onClick={() => setScreen("stats")}
          >
            Завершить
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskSetPlayer;