import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import TaskItem from '../components/TaskItem';


const TaskBank = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/taskBank/tasks/');
                setTasks(response.data);
            } catch (err) {
                console.error("Ошибка загрузки заданий:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const subjects = [...new Set(tasks.map(t => t.subject))];

    if (loading) return <div>Загрузка банка заданий...</div>;

    return (
        <div className="task-bank">
            <h1>Банк заданий</h1>
            {subjects.map(subject => (
                <section key={subject} style={{ marginBottom: '30px' }}>
                    <h2 style={{ borderBottom: '2px solid #007bff' }}>{subject}</h2>
                    {tasks
                        .filter(t => t.subject === subject)
                        .map(task => <TaskItem key={task.id} task={task} />)
                    }
                </section>
            ))}
        </div>
    );
};

export default TaskBank;