const TaskStats = ({
  currentSet,
  isExam,
  serverScore,
  tasks,
  checked,
  answers,
  retry,
  navigate
}) => {
  const total = tasks.length;
  const correctCount = Object.values(checked).filter(Boolean).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Результаты: {currentSet?.name}</h2>

      {isExam && (
        <p>
          Итог экзамена (backend): {serverScore ?? correctCount} из {total}
        </p>
      )}

      <p>
        Верных ответов: {correctCount} из {total} ({pct}%)
      </p>

      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>№</th>
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
              <tr key={task.id}>
                <td>{task._order ?? i + 1}</td>
                <td>{task.subject_display || task.subject}</td>
                <td>{task.type}</td>
                <td>{task.difficulty}</td>
                <td>{userAns ?? "—"}</td>
                <td>
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

      <br />

      <button onClick={retry}>Пройти снова</button>{" "}
      <button onClick={() => navigate("/tasksets")}>
        К списку вариантов
      </button>
    </div>
  );
};

export default TaskStats;