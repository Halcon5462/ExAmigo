export const MatchInfoTips = () => {
  return (
    <section className="match-page__section" style={{ marginTop: "24px" }}>
      <h2 className="match-page__section-title text">
        Как проходит матч
      </h2>

      <div className="match-page__tips">
        <div className="match-page__tip">
          <strong className="text">1. Общий вариант</strong>
          <span className="description_text">
            После подключения обоим игрокам выдаётся один и тот же набор заданий.
          </span>
        </div>

        <div className="match-page__tip">
          <strong className="text">2. Живой прогресс</strong>
          <span className="description_text">
            Во время решения видно, как соперник проходит задачи и где ошибается.
          </span>
        </div>

        <div className="match-page__tip">
          <strong className="text">3. Итоговый разбор</strong>
          <span className="description_text">
            После завершения отображается счёт и таблица по всем заданиям.
          </span>
        </div>
      </div>
    </section>
  );
};