export const AutoGeneratorHero = ({ availableCount }) => {
  return (
    <section className="adaptive-generator-page__hero">
      <div className="adaptive-generator-page__hero-copy">
        <span className="adaptive-generator-page__eyebrow text_mini">
          Персональная сборка
        </span>

        <h1 className="adaptive-generator-page__title text">
          Адаптивный вариант по статистике
        </h1>

        <p className="adaptive-generator-page__description description_text">
          Выберите предмет и режим генерации. Система соберет вариант на основе доступных заданий.
        </p>
      </div>

      <div className="adaptive-generator-page__hero-note">
        <span className="adaptive-generator-page__hero-note-value text">
          {availableCount}
        </span>

        <span className="adaptive-generator-page__hero-note-label description_text">
          доступных номеров для выбранного предмета
        </span>
      </div>
    </section>
  );
};