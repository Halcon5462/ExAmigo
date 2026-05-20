import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import TaskBankHero from '../../components/taskBank/TaskBankHero';
import TaskBankPanel from '../../components/taskBank/TaskBankPanel';

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
            <TaskBankHero navigate={navigate} />
            <TaskBankPanel
                options={options}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default TaskBank;
