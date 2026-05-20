export const MatchModal = ({
  showModal,
  setShowModal,
  currentMatchId,
  joinMatchId,
  status,
  statusTextMap,
}) => {
  if (!showModal) return null;

  return (
    <div className="match-page__modal">
      <div className="match-page__modal-card">
        <span className="match-page__eyebrow text_mini">
          Комната матча
        </span>

        <h3 className="text">Матч создан</h3>

        <p className="description_text">
          Комната уже открыта. Передайте идентификатор сопернику и дождитесь его подключения.
        </p>

        <div className="match-page__modal-id">
          <span className="text_mini">ID матча</span>
          <strong>{currentMatchId || joinMatchId}</strong>
        </div>

        {status !== "idle" && (
          <div className="match-page__status">
            <span className="match-page__status-indicator" />

            <div>
              <strong className="text">
                {statusTextMap[status]?.title ||
                  "Подготовка комнаты"}
              </strong>

              <div className="description_text">
                {statusTextMap[status]?.description ||
                  "Ожидаем обновления статуса матча."}
              </div>
            </div>
          </div>
        )}

        <div className="match-page__actions">
          <button
            type="button"
            className="match-page__button-secondary btn_text"
            onClick={() => setShowModal(false)}
          >
            Скрыть окно
          </button>
        </div>
      </div>
    </div>
  );
};