import React, { useState, useEffect } from "react";
import api from "../utils/api";
import TaskItem from "../components/TaskItem";

const TestPage = () => {
    const [tasks, setTasks] = useState([]);
    const [hints, setHints] = useState({});
    const [selectedLevels, setSelectedLevels] = useState({});
    const [loadingTaskId, setLoadingTaskId] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleGetHint = async (task, level) => {
        // уже есть подсказка
        if (hints[task.id]?.[level]) {
            setSelectedLevels(prev => ({
                ...prev,
                [task.id]: level
            }));
            return;
        }

        setLoadingTaskId(task.id);

        try {
            const res = await api.post("/helpAi/hint/", {
                task_id: task.id,
                level: level,
            });

            setHints(prev => ({
                ...prev,
                [task.id]: {
                    ...prev[task.id],
                    [level]: res.data.hint
                }
            }));

            setSelectedLevels(prev => ({
                ...prev,
                [task.id]: level
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

            {tasks.map((task) => {
                const currentLevel = selectedLevels[task.id];

                return (
                    <div
                        key={task.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "10px",
                        }}
                    >
                        {/* Задание */}
                        <TaskItem task={task} />

                        {/* КНОПКИ УРОВНЕЙ */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

                            {/* LEVEL 1 */}
                            <button
                                onClick={() => handleGetHint(task, 1)}
                                disabled={loadingTaskId === task.id}
                            >
                                {loadingTaskId === task.id
                                    ? "..."
                                    : hints[task.id]?.[1]
                                        ? "✓ Намёк"
                                        : "Намёк (-1 💰)"}
                            </button>

                            {/* LEVEL 2 */}
                            <button
                                onClick={() => handleGetHint(task, 2)}
                                disabled={!hints[task.id]?.[1] || loadingTaskId === task.id}
                            >
                                {loadingTaskId === task.id
                                    ? "..."
                                    : hints[task.id]?.[2]
                                        ? "✓ Идея"
                                        : "Идея (-2 💰)"}
                            </button>

                            {/* LEVEL 3 */}
                            <button
                                onClick={() => handleGetHint(task, 3)}
                                disabled={!hints[task.id]?.[2] || loadingTaskId === task.id}
                            >
                                {loadingTaskId === task.id
                                    ? "..."
                                    : hints[task.id]?.[3]
                                        ? "✓ Почти решение"
                                        : "Решение (-3 💰)"}
                            </button>

                        </div>

                        {/* ВЫВОД ПОДСКАЗОК */}
                        {hints[task.id] && (
                            <div
                                style={{
                                    marginTop: "15px",
                                    padding: "10px",
                                    background: "#f9f9f9",
                                    borderRadius: "5px",
                                }}
                            >
                                <strong>Подсказки:</strong>

                                {Object.entries(hints[task.id]).map(([lvl, text]) => (
                                    <div
                                        key={lvl}
                                        style={{
                                            marginTop: "10px",
                                            padding: "8px",
                                            background: currentLevel == lvl ? "#e6f7ff" : "#fff",
                                            borderRadius: "5px",
                                            border: "1px solid #ddd"
                                        }}
                                    >
                                        <strong>Уровень {lvl}:</strong>
                                        <p style={{ margin: 0 }}>{text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TestPage;