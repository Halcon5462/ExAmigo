import React, { useEffect, useState } from 'react';
import TaskItem from '../components/TaskItem';


const TaskBank = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/tasks/');
            if (!response.ok) throw new Error('Ошибка при загрузке данных');

            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const groupedTasks = tasks.reduce((acc, task) => {
        if (!acc[task.subject]) {
            acc[task.subject] = [];
        }
        acc[task.subject].push(task);
        return acc;
    }, {});

    if (loading) return <p>Загрузка заданий...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div>
            <h2>Банк заданий</h2>
            {Object.keys(groupedTasks).map((subject, index) => (
                <div key={index} style={{ marginBottom: '40px' }}>
                    <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '5px' }}>
                        Раздел: {subject}
                    </h3>

                    <div className="task-list">
                        {groupedTasks[subject].map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            ))}

            {tasks.length === 0 && <p>Заданий пока нет.</p>}
        </div>
    );
};

export default TaskBank;