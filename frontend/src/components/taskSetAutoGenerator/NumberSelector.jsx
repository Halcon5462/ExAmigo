export const NumberSelector = ({
  mode,
  subject,
  selectedSubjectLabel,
  availableNumbers,
  selectedNumbers,
  toggleNumber,
}) => {
  if (mode !== "custom" || !subject) return null;

  return (
    <div className="adaptive-generator-form__section">
      <div className="adaptive-generator-form__section-head">
        <div>
          <div className="adaptive-generator-form__section-title text">
            Номера заданий КИМ
          </div>

          <p className="adaptive-generator-form__section-text description_text">
            Выбран предмет: {selectedSubjectLabel}
          </p>
        </div>

        <div className="adaptive-generator-form__counter text_mini">
          Выбрано: {selectedNumbers.length}
        </div>
      </div>

      {availableNumbers.length === 0 && (
        <div className="adaptive-generator-form__empty description_text">
          Для этого предмета пока нет заданий в банке.
        </div>
      )}

      <div className="adaptive-generator-form__chips">
        {availableNumbers.map((num) => (
          <label
            key={num}
            className={`adaptive-generator-form__chip ${
              selectedNumbers.includes(num)
                ? "adaptive-generator-form__chip_active"
                : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedNumbers.includes(num)}
              onChange={() => toggleNumber(num)}
            />
            <span>№{num}</span>
          </label>
        ))}
      </div>
    </div>
  );
};