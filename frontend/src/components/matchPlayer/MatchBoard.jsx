import React from "react";
import OpponentProgressBar from "../match/OpponentProgressBar";

const MatchBoard = ({ opponentProgress, tasks }) => {
  return (
    <div className="match-play-page__board">
      <OpponentProgressBar
        progress={opponentProgress}
        taskIds={tasks.map((t) => t.id)}
        compact
      />
    </div>
  );
};

export default MatchBoard;