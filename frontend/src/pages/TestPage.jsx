import React, { useState, useEffect } from "react";
import api from "../utils/api";
import TaskItem from "../components/TaskItem";

const TestPage = () => {
    const [tasks, setTasks] = useState([]);
    const [hints, setHints] = useState({});
    const [selectedLevels, setSelectedLevels] = useState({});
    const [loadingTaskId, setLoadingTaskId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [questions, setQuestions] = useState({});
    const [answers, setAnswers] = useState({});
    const [loadingQuestionId, setLoadingQuestionId] = useState(null);

    const [prices, setPrices] = useState({});

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

    const handleAskQuestion = async (task) => {
        const question = questions[task.id];

        if (!question) {
            alert("Введите вопрос");
            return;
        }

        if (answers[task.id]){
            alert('Подсказка уже получена!');
            return;
        }

        setLoadingQuestionId(task.id);

        try {
            const res = await api.post("/helpAi/ask/", {
                task_id: task.id,
                question: question,
            });

            setAnswers(prev => ({
                ...prev,
                [task.id]: res.data.answer
            }));

        } catch (err) {
            alert("Ошибка при запросе");
        } finally {
            setLoadingQuestionId(null);
        }
    };

    const getHintText = (task, level) => {
        if (loadingTaskId === task.id) return "...";
        if (hints[task.id]?.[level]) return "✓ Получено";
        return `Получить (-${prices[level]} 💰)`;
    };

    useEffect(() => {
        api.get("/helpAi/prices/").then(res => {
            setPrices(res.data);
        });
    }, []);

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

                            <button onClick={() => handleGetHint(task, 1)}>
                                {getHintText(task, 1)}
                            </button>

                            <button onClick={() => handleGetHint(task, 2)}>
                                {getHintText(task, 2)}
                            </button>

                            <button onClick={() => handleGetHint(task, 3)}>
                                {getHintText(task, 3)}
                            </button>

                        </div>

                        <div style={{ marginTop: "10px" }}>
                            <input
                                type="text"
                                placeholder="Задать вопрос по задаче за 100"
                                value={questions[task.id] || ""}
                                onChange={(e) =>
                                    setQuestions(prev => ({
                                        ...prev,
                                        [task.id]: e.target.value
                                    }))
                                }
                                style={{ width: "100%", marginBottom: "5px" }}
                            />

                            <button
                                onClick={() => handleAskQuestion(task)}
                                disabled={loadingQuestionId === task.id}
                            >
                                {loadingQuestionId === task.id ? "Думаю..." : "Спросить"}
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
                                        <p style={{ margin: 0, whiteSpace: "pre-line" }}>{text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {answers[task.id] && (
                            <div
                                style={{
                                    marginTop: "10px",
                                    padding: "10px",
                                    background: "#eef",
                                    borderRadius: "5px",
                                    whiteSpace: "pre-line"
                                }}
                            >
                                <strong>Ответ:</strong>
                                <p>{answers[task.id]}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TestPage;