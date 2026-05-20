export const MatchCreateHero = ({ showModal }) => {
  return (
    <section className="match-page__hero">
      <div>
        <span className="match-page__eyebrow text_mini">PvP режим</span>

        <h1 className="match-page__title text">
          Матчи один на один
        </h1>

        <p className="match-page__description description_text">
          Создайте комнату, выберите предмет и запустите соревновательный режим
          на том же наборе заданий, который получит соперник.
        </p>
      </div>

      <div className="match-page__hero-badge">
        <span className="text_mini">Текущий статус</span>
        <strong>
          {showModal ? "Комната открыта" : "Готов к старту"}
        </strong>
      </div>
    </section>
  );
};