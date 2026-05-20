export const JoinMatchForm = ({
  joinMatchId,
  setJoinMatchId,
  handleJoinMatch,
}) => {
  return (
    <section className="match-page__section">
      <h2 className="match-page__section-title text">
        Подключиться к матчу
      </h2>

      <p className="match-page__section-description description_text">
        Введите ID комнаты, который прислал вам соперник, и подключитесь к матчу.
      </p>

      <div className="match-page__form">
        <label className="match-page__field">
          <span className="match-page__label text_mini">
            ID матча
          </span>

          <input
            className="match-page__input"
            type="text"
            placeholder="Например: 42"
            value={joinMatchId}
            onChange={(e) => setJoinMatchId(e.target.value)}
          />
        </label>

        <div className="match-page__actions">
          <button
            type="button"
            className="match-page__button-secondary btn_text"
            onClick={handleJoinMatch}
          >
            Подключиться
          </button>
        </div>
      </div>
    </section>
  );
};