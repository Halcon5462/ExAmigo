export const CreateMatchForm = ({
  subject,
  setSubject,
  subjectOptions,
  handleCreateMatch,
  loading,
}) => {
  return (
    <section className="match-page__section">
      <h2 className="match-page__section-title text">
        Создать матч
      </h2>

      <p className="match-page__section-description description_text">
        Хост создаёт комнату и отправляет ID второму участнику.
      </p>

      <div className="match-page__form">
        <label className="match-page__field">
          <span className="match-page__label text_mini">
            Предмет
          </span>

          <select
            className="match-page__select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjectOptions.map((option) => (
              <option
                key={option.value || "default"}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="match-page__actions">
          <button
            type="button"
            className="match-page__button btn_text"
            onClick={handleCreateMatch}
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать матч"}
          </button>
        </div>
      </div>
    </section>
  );
};