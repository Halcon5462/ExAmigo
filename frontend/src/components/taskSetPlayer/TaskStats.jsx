import '../../static/css/taskSetResults.css';

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
    <div className="taskset-results-page">
      <section className="taskset-results-page__hero">
        <div className="taskset-results-page__hero-copy">
          <span className="taskset-results-page__eyebrow text_mini">Разбор попытки</span>
          <h2 className="taskset-results-page__title text">Результаты: {currentSet?.name}</h2>
          <p className="taskset-results-page__subtitle description_text">
            Сводка по решенному варианту и детализация по каждому заданию.
          </p>
        </div>

        <div className="taskset-results-page__score-card">
          <div className="taskset-results-page__score-value">{pct}%</div>
          <div className="taskset-results-page__score-text description_text">
            Верных ответов: {correctCount} из {total}
          </div>
          {isExam && (
            <div className="taskset-results-page__score-meta text_mini">
              Итог экзамена: {serverScore ?? correctCount} из {total}
            </div>
          )}
        </div>
      </section>

      <section className="taskset-results-page__summary">
        <article className="taskset-results-page__summary-card">
          <span className="text_mini">Всего заданий</span>
          <strong>{total}</strong>
        </article>
        <article className="taskset-results-page__summary-card">
          <span className="text_mini">Верных</span>
          <strong>{correctCount}</strong>
        </article>
        <article className="taskset-results-page__summary-card">
          <span className="text_mini">Неверных или пропущенных</span>
          <strong>{Math.max(total - correctCount, 0)}</strong>
        </article>
      </section>

      <section className="taskset-results-page__table-section">
        <div className="taskset-results-page__table-wrap">
          <table className="taskset-results-page__table">
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
                const statusText = userAns !== undefined
                  ? isCorrect
                    ? 'Верно'
                    : 'Неверно'
                  : 'Не отвечено';

                return (
                  <tr key={task.id}>
                    <td>{task._order ?? i + 1}</td>
                    <td>{task.subject_display || task.subject}</td>
                    <td>{task.type}</td>
                    <td>{task.difficulty}</td>
                    <td>{userAns ?? '—'}</td>
                    <td>
                      <span
                        className={`taskset-results-page__status ${
                          isCorrect
                            ? 'taskset-results-page__status_correct'
                            : userAns !== undefined
                              ? 'taskset-results-page__status_wrong'
                              : 'taskset-results-page__status_empty'
                        }`}
                      >
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="taskset-results-page__actions">
        <button type="button" className="taskset-results-page__primary-action btn_text" onClick={retry}>
          Пройти снова
        </button>
        <button
          type="button"
          className="taskset-results-page__secondary-action btn_text"
          onClick={() => navigate('/tasksets')}
        >
          К списку вариантов
        </button>
      </div>
    </div>
  );
};

export default TaskStats;
