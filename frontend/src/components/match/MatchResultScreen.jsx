import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../static/css/match.css";

const MatchResultScreen = ({ myChecked, answers = {}, opponentProgress, tasks }) => {
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const myScore = Object.values(myChecked).filter(Boolean).length;
  const oppScore = Object.values(opponentProgress).filter(Boolean).length;
  const totalTasks = tasks.length;

  const resultMeta = useMemo(() => {
    if (myScore > oppScore) {
      return {
        title: "Победа",
        description: "Вы опередили соперника по числу верных ответов.",
        className: "match-result-page__result",
      };
    }

    if (myScore < oppScore) {
      return {
        title: "Поражение",
        description: "Соперник набрал больше верных ответов в этом матче.",
        className: "match-result-page__result match-result-page__result_loss",
      };
    }

    return {
      title: "Ничья",
      description: "Оба игрока завершили матч с одинаковым счётом.",
      className: "match-result-page__result match-result-page__result_draw",
    };
  }, [myScore, oppScore]);

  const getStatusClassName = (value) => {
    if (value === undefined) {
      return "match-result-page__status match-result-page__status_empty";
    }

    return value
      ? "match-result-page__status match-result-page__status_correct"
      : "match-result-page__status match-result-page__status_wrong";
  };

  const getStatusLabel = (value) => {
    if (value === undefined) return "Не отвечено";
    return value ? "Верно" : "Неверно";
  };

  const getOpponentAnswerLabel = (value) => {
    if (value === undefined) return "—";
    return value ? "Верно" : "Неверно";
  };

  return (
    <div className="match-result-page">
      <section className="match-result-page__hero match-result-page__hero_compact">
        <div>
          <span className="match-result-page__eyebrow text_mini">Матч завершён</span>
          <h1 className="match-result-page__title text">Итоги матча</h1>
          <p className="match-result-page__description description_text">
            {resultMeta.description}
          </p>
          <div className={resultMeta.className}>
            <strong>{resultMeta.title}</strong>
          </div>
        </div>

        <div className="match-result-page__hero-badge">
          <span className="text_mini">Счёт</span>
          <strong>{myScore} : {oppScore}</strong>
        </div>
      </section>

      <section className="match-result-page__summary match-result-page__summary_compact">
        <article className="match-result-page__summary-card">
          <span className="text_mini">Ваш результат</span>
          <strong>{myScore}</strong>
        </article>
        <article className="match-result-page__summary-card">
          <span className="text_mini">Результат соперника</span>
          <strong>{oppScore}</strong>
        </article>
        <article className="match-result-page__summary-card">
          <span className="text_mini">Всего заданий</span>
          <strong>{totalTasks}</strong>
        </article>
      </section>

      <section className="match-result-page__details">
        <button
          type="button"
          className="match-result-page__toggle btn_text"
          onClick={() => setIsDetailsOpen((prev) => !prev)}
        >
          {isDetailsOpen ? "Скрыть статистику по заданиям" : "Показать статистику по заданиям"}
        </button>

        {isDetailsOpen && (
          <div className="match-result-page__table-wrap">
            <table className="match-result-page__table match-result-page__table_compact">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Ваш ответ</th>
                  <th>Ответ соперника</th>
                  <th>Итог</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task, index) => {
                  const myVal = myChecked[task.id];
                  const oppVal = opponentProgress[task.id];
                  const myAnswer = answers[task.id];

                  return (
                    <tr key={task.id}>
                      <td>{task._order ?? index + 1}</td>
                      <td>{myAnswer || "—"}</td>
                      <td>{getOpponentAnswerLabel(oppVal)}</td>
                      <td>
                        <span className={getStatusClassName(myVal)}>{getStatusLabel(myVal)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="match-result-page__actions" style={{ marginTop: "24px" }}>
        <button
          type="button"
          className="match-result-page__button btn_text"
          onClick={() => navigate("/match")}
        >
          К созданию матча
        </button>
      </div>
    </div>
  );
};

export default MatchResultScreen;
