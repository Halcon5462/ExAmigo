import React from "react";

const OpponentProgressBar = ({ progress, taskIds }) => {
  return (
    <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
      {taskIds.map((taskId) => {
        const isCorrect = progress[taskId];

        return (
          <div
            key={taskId}
            style={{
              width: "10px",
              height: "10px",
              background:
                isCorrect === undefined
                  ? "#ccc"
                  : isCorrect
                  ? "green"
                  : "red",
            }}
          />
        );
      })}
    </div>
  );
};

export default OpponentProgressBar;