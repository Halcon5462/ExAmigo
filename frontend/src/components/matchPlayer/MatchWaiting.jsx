import React from "react";

const MatchWaiting = ({
  myCorrectCount,
  opponentAnsweredCount,
  opponentCorrectCount,
  totalTasks,
}) => {
  return (
    <div className="match-play-page">
      <section className="match-play-page__waiting">
        <div className="match-play-page__waiting-head">
          <span className="match-play-page__waiting-indicator" />
          <h1 className="match-play-page__waiting-title text">
            Ожидание соперника
          </h1>
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
            <strong>
              {opponentAnsweredCount} / {totalTasks}
            </strong>
          </div>

          <div className="match-play-page__waiting-card">
            <span className="text_mini">Верных у соперника</span>
            <strong>{opponentCorrectCount}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchWaiting;