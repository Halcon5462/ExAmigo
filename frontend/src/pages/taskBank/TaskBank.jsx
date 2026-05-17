import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TaskBankFilters from '../../components/Filter/TaskBankFilters';
import '../../static/css/taskBank.css';

const TaskBank = () => {
    const [options, setOptions] = useState({});
    const [filters, setFilters] = useState({
        subject: '',
        order_KIM: '',
        type: '',
        difficulty: '',
        author: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/taskBank/filter-options/').then((r) => setOptions(r.data));
    }, []);

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.append(key, val);
        });
        navigate(`/tasks/results?${params.toString()}`);
    };

    return (
        <div className="task-bank-page">
            <section className="task-bank-page__hero">
                <div className="task-bank-page__hero-content">
                    <span className="task-bank-page__eyebrow text_mini">Подборка заданий</span>
                    <h1 className="task-bank-page__title text">Банк заданий</h1>
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
                    onFilterChange={handleFilterChange}
                />

                <div className="task-bank-page__actions">
                    <button
                        type="button"
                        className="task-bank-page__primary-action btn_text"
                        onClick={handleSubmit}
                    >
                        Найти задания
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TaskBank;
