import React from "react";
import "../../static/css/match.css";

const OpponentProgressBar = ({ progress, taskIds, compact = false }) => {
  const answeredCount = Object.keys(progress).length;
  const correctCount = Object.values(progress).filter(Boolean).length;
  const totalCount = taskIds.length;

  const getStateClassName = (value) => {
    if (value === undefined) return "match-opponent-bar__cell match-opponent-bar__cell_pending";
    return value
      ? "match-opponent-bar__cell match-opponent-bar__cell_correct"
      : "match-opponent-bar__cell match-opponent-bar__cell_wrong";
  };

  const getStateSymbol = (value) => {
    if (value === undefined) return "…";
    return value ? "✓" : "✕";
  };

  return (
    <section className={`match-opponent-bar${compact ? " match-opponent-bar_compact" : ""}`}>
      <div className="match-opponent-bar__header">
        <div>
          <h2 className="match-opponent-bar__title text">Прогресс соперника</h2>
          <p className="match-opponent-bar__description description_text">
            {compact
              ? "Короткая сводка по ходу матча."
              : "Состояние обновляется после каждой отправленной проверки."}
          </p>
        </div>

        <div className="match-opponent-bar__metrics">
          <div className="match-opponent-bar__metric">
            <span className="text_mini">Решено</span>
            <strong>{answeredCount} / {totalCount}</strong>
          </div>
          <div className="match-opponent-bar__metric">
            <span className="text_mini">Верных</span>
            <strong>{correctCount}</strong>
          </div>
        </div>
      </div>

      <div className="match-opponent-bar__track">
        {taskIds.map((taskId, index) => {
          const isCorrect = progress[taskId];

          return (
            <div key={taskId} className={getStateClassName(isCorrect)}>
              <span className="match-opponent-bar__cell-index text_mini">#{index + 1}</span>
              <span className="match-opponent-bar__cell-icon">{getStateSymbol(isCorrect)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OpponentProgressBar;
