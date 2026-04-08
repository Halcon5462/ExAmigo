import React from "react";

const MatchResultScreen = ({ myChecked, opponentProgress, totalTasks }) => {
  const myScore = Object.values(myChecked).filter(Boolean).length;
  const oppScore = Object.values(opponentProgress).filter(Boolean).length;

  const getResultText = () => {
    if (myScore > oppScore) return "🏆 Победа!";
    if (myScore < oppScore) return "😢 Поражение";
    return "🤝 Ничья";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Матч завершён</h2>

      <h1>{getResultText()}</h1>

      <p>Вы: {myScore}</p>
      <p>Соперник: {oppScore}</p>

      <h3>Разбор</h3>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>№</th>
            <th>Вы</th>
            <th>Соперник</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: totalTasks }).map((_, i) => {
            const myVal = Object.values(myChecked)[i];
            const oppVal = Object.values(opponentProgress)[i];

            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{myVal ? "✔" : "✖"}</td>
                <td>{oppVal ? "✔" : "✖"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MatchResultScreen;