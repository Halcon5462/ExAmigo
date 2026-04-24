import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TaskItem from '../../components/task/TaskItem';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/taskBank/tasks/${location.search}`);
                setTasks(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [location.search]);

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="task-list">
            <button onClick={() => navigate('/tasks')}>← Изменить фильтры</button>
            <h2>Найдено заданий: {tasks.length}</h2>
            {tasks.length === 0
                ? <p>Ничего не найдено. Попробуйте изменить фильтры.</p>
                : tasks.map(task => <TaskItem key={task.id} task={task} />)
            }
        </div>
    );
};

export default TaskList;