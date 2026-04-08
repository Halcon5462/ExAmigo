import React from "react";

const OpponentProgressBar = ({ progress, totalTasks }) => {
  const values = Object.values(progress);

  return (
    <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
      {Array.from({ length: totalTasks || 0 }).map((_, i) => {
        const isCorrect = values[i];

        return (
          <div
            key={i}
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