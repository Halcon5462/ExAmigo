import React, { useState, useEffect } from "react";
import api from "../utils/api";
import TaskItem from "../components/TaskItem";

const TestPage = () => {
    const [tasks, setTasks] = useState([])
    const [hints, setHints] = useState({});
    const [loadingTaskId, setLoadingTaskId] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleGetHint = async (task) => {
        //уже есть подсказка — не дергаем повторно
        if (hints[task.id]) return;

        setLoadingTaskId(task.id);

        try {
            const res = await api.post("/helpAi/hint/", {
                task_id: task.id,
                task: task.text,
            });

            setHints((prev) => ({
                ...prev,
                [task.id]: res.data.hint,
            }));
        } catch (err) {
            alert(err.response?.data?.error || "Ошибка при получении подсказки");
        } finally {
            setLoadingTaskId(null);
        }
    };

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

    if (loading) return <div>Загрузка...</div>;
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2>Тест подсказок</h2>

        {tasks.map((task) => (
            <div
            key={task.id}
            style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "10px",
            }}
            >
            {/* Твое задание */}
            <TaskItem task={task} />

            {/* Кнопка подсказки */}
            <button
                onClick={() => handleGetHint(task)}
                disabled={loadingTaskId === task.id}
                style={{ marginTop: "10px" }}
            >
                {loadingTaskId === task.id
                ? "Загрузка..."
                : hints[task.id]
                ? "Подсказка получена"
                : "Получить подсказку (-1 💰)"}
            </button>

            {/* Вывод подсказки */}
            {hints[task.id] && (
                <div
                style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#f5f5f5",
                    borderRadius: "5px",
                }}
                >
                <strong>Подсказка:</strong>
                <p>{hints[task.id]}</p>
                </div>
            )}
            </div>
        ))}
        </div>
    );
};

export default TestPage;