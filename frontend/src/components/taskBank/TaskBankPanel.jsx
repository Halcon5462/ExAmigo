import React from 'react';
import TaskBankFilters from './TaskBankFilters';

const TaskBankPanel = ({ options, filters, onFilterChange, onSubmit }) => {
    return (
        <section className="task-bank-page__panel">
            <div className="task-bank-page__panel-header">
                <h2 className="task-bank-page__panel-title text">Фильтрация</h2>
                <p className="task-bank-page__panel-description description_text">
                    Используйте готовые параметры для точного поиска по банку.
                </p>
            </div>

            <TaskBankFilters
                options={options}
                filters={filters}
                onFilterChange={onFilterChange}
            />

            <div className="task-bank-page__actions">
                <button
                    type="button"
                    className="task-bank-page__primary-action btn_text"
                    onClick={onSubmit}
                >
                    Найти задания
                </button>
            </div>
        </section>
    );
};

export default TaskBankPanel;