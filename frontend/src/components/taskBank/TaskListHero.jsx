import React from 'react';

const TaskListHero = ({ tasksCount, onBack }) => {
    return (
        <section className="task-list-page__hero">
            <button
                type="button"
                className="task-list-page__back-button btn_text"
                onClick={onBack}
            >
                ← Изменить фильтры
            </button>

            <div className="task-list-page__hero-copy">
                <span className="task-list-page__eyebrow text_mini">
                    Результаты поиска
                </span>

                <h1 className="task-list-page__title text">
                    Найдено заданий: {tasksCount}
                </h1>

                <p className="task-list-page__description description_text">
                    Просмотрите найденные задания и при необходимости
                    скорректируйте фильтрацию.
                </p>
            </div>
        </section>
    );
};

export default TaskListHero;