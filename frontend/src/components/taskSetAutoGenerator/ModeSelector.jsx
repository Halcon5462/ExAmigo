export const ModeSelector = ({
  mode,
  setMode,
  subject,
}) => {
  return (
    <div className="adaptive-generator-form__section">
      <div className="adaptive-generator-form__section-title text">
        Режим создания комплекта
      </div>

      <div className="adaptive-generator-form__mode-list">
        <label
          className={`adaptive-generator-form__mode ${
            mode === "full"
              ? "adaptive-generator-form__mode_active"
              : ""
          }`}
        >
          <input
            type="radio"
            value="full"
            checked={mode === "full"}
            onChange={() => setMode("full")}
          />
          <span className="description_text">
            Полный комплект по предмету
          </span>
        </label>

        <label
          className={`adaptive-generator-form__mode ${
            mode === "custom"
              ? "adaptive-generator-form__mode_active"
              : ""
          }`}
        >
          <input
            type="radio"
            value="custom"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
            disabled={!subject}
          />
          <span className="description_text">
            Выбрать номера заданий КИМ
          </span>
        </label>
      </div>
    </div>
  );
};