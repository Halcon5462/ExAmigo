import React from 'react';

const TaskBankHero = ({ navigate }) => {
    return (
        <section className="task-bank-page__hero">
            <div className="task-bank-page__hero-content">
                <span className="task-bank-page__eyebrow text_mini">
                    Подборка заданий
                </span>

                <h1 className="task-bank-page__title text">
                    Банк заданий
                </h1>

                <p className="task-bank-page__description description_text">
                    Отфильтруйте задания по предмету, номеру, типу, сложности и автору, затем перейдите к результатам.
                </p>
            </div>

            <button
                type="button"
                className="task-bank-page__secondary-action btn_text"
                onClick={() => navigate('/tasksets/auto')}
            >
                Сгенерировать адаптивный вариант
            </button>
        </section>
    );
};

export default TaskBankHero;
