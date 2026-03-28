import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TaskItem from '../components/TaskItem';
import TaskBankFilters from '../components/Filter/TaskBankFilters';

const TaskBank = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subject: '',
        orderKIM: '',
        type: '',
        difficulty: '',
        author: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/taskBank/tasks/');
                setTasks(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const filteredTasks = tasks.filter(task => {
        if (filters.subject && task.subject !== filters.subject) return false;
        if (filters.orderKIM && String(task.order_KIM) !== filters.orderKIM) return false;
        if (filters.type && task.type !== filters.type) return false;
        if (filters.difficulty && String(task.difficulty) !== filters.difficulty) return false;
        if (filters.author) {
            const authorValue = task.author_name || task.author_email || String(task.author || '');
            if (authorValue !== filters.author) return false;
        }
        return true;
    });

    const displayedSubjects = [...new Set(filteredTasks.map(t => t.subject).filter(Boolean))];
    const subjectLabels = Object.fromEntries(
        filteredTasks
            .filter(task => task.subject)
            .map(task => [task.subject, task.subject_display || task.subject])
    );

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="task-bank">
            <h1>Банк заданий</h1>
            <TaskBankFilters
                tasks={tasks}
                filters={filters}
                onFilterChange={handleFilterChange}
            />
            <button onClick={() => navigate('/tasksets/auto')} style={{ marginBottom: '15px' }}>
                Сгенерировать адаптивный вариант
            </button>
            {displayedSubjects.map(subject => (
                <div key={subject} className="task-container">
                    <div className="task-info">
                        <span>{subjectLabels[subject] || subject}</span>
                    </div>
                    {filteredTasks
                        .filter(t => t.subject === subject)
                        .map(task => <TaskItem key={task.id} task={task} />)
                    }
                </div>
            ))}
        </div>
    );
};

export default TaskBank;
