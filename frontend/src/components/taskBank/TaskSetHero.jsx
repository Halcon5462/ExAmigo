export const TaskSetHero = ({ selectedCount }) => {
  return (
    <section className="taskset-creator-page__hero">
      <div className="taskset-creator-page__hero-copy">
        <span className="taskset-creator-page__eyebrow text_mini">
          Ручная сборка
        </span>

        <h1 className="taskset-creator-page__title text">
          Создание варианта
        </h1>

        <p className="taskset-creator-page__description description_text">
          Соберите тренировочный комплект вручную или сгенерируйте экзамен по выбранному предмету.
        </p>
      </div>

      <div className="taskset-creator-page__hero-note">
        <span className="taskset-creator-page__hero-note-value text">
          {selectedCount}
        </span>

        <span className="taskset-creator-page__hero-note-label description_text">
          заданий в новом комплекте
        </span>
      </div>
    </section>
  );
};