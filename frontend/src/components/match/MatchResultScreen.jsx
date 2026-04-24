import React from "react";

const MatchResultScreen = ({ myChecked, opponentProgress, tasks }) => {
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
          {tasks.map((task, i) => {
            const myVal = myChecked[task.id];
            const oppVal = opponentProgress[task.id];

            return (
              <tr key={task.id}>
                <td>{i + 1}</td>
                <td>{myVal === undefined ? "—" : myVal ? "✔" : "✖"}</td>
                <td>{oppVal === undefined ? "—" : oppVal ? "✔" : "✖"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MatchResultScreen;