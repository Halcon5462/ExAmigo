import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../../utils/api';
import TaskItem from '../../components/task/TaskItem';

import TaskListHero from '../../components/taskBank/TaskListHero';

import '../../static/css/taskList.css';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/helpAi/prices/').then((res) => {
            setPrices(res.data);
        });
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);

            try {
                const response = await api.get(
                    `/taskBank/tasks/${location.search}`
                );
                setTasks(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [location.search]);

    if (loading) {
        return (
            <div className="task-list-page task-list-page_status">
                Загрузка...
            </div>
        );
    }

    return (
        <div className="task-list-page">
            <TaskListHero
                tasksCount={tasks.length}
                onBack={() => navigate('/tasks')}
            />

            <section className="task-list-page__content">
                {tasks.length === 0 ? (
                    <div className="task-list-page__empty description_text">
                        Ничего не найдено. Попробуйте изменить фильтры.
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            prices={prices}
                        />
                    ))
                )}
            </section>
        </div>
    );
};

export default TaskList;