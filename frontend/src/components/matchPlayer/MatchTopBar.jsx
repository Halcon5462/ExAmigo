import React from "react";

const MatchTopBar = ({
  matchId,
  myChecked,
  totalTasks,
  tasksLength,
  myCorrectCount,
  opponentAnsweredCount,
}) => {
  return (
    <section className="match-play-page__topbar">
      <div className="match-play-page__topbar-main">
        <span className="match-play-page__match-id text_mini">
          Матч #{matchId}
        </span>

        <div className="match-play-page__topbar-stats">
          <span className="match-play-page__topbar-stat text_mini">
            Ваш прогресс: {Object.keys(myChecked).length} /{" "}
            {totalTasks || tasksLength || 0}
          </span>

          <span className="match-play-page__topbar-stat text_mini">
            Верных: {myCorrectCount}
          </span>

          <span className="match-play-page__topbar-stat text_mini">
            Соперник решил: {opponentAnsweredCount}
          </span>
        </div>
      </div>
    </section>
  );
};

export default MatchTopBar;