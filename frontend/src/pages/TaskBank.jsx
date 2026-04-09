import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TaskBankFilters from '../components/Filter/TaskBankFilters';

const TaskBank = () => {
    const [options, setOptions] = useState({});
    const [filters, setFilters] = useState({
        subject: '',
        orderKIM: '',
        type: '',
        difficulty: '',
        author: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/taskBank/filter-options/').then(r => setOptions(r.data));
    }, []);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.append(key, val);
        });
        navigate(`/tasks/results?${params.toString()}`);
    };

    return (
        <div className="task-bank">
            <h1>Банк заданий</h1>
            <TaskBankFilters
                options={options}
                filters={filters}
                onFilterChange={handleFilterChange}
            />
            <button onClick={handleSubmit}>Найти задания</button>
            <button onClick={() => navigate('/tasksets/auto')} style={{ marginBottom: '15px' }}>
                Сгенерировать адаптивный вариант
            </button>
        </div>
    );
};

export default TaskBank;