import React, { useState, useEffect } from "react";
import api from "../utils/api";
import TaskItem from "../components/task/TaskItem";

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
            alert(err.response?.data?.error || "Ошибка при получении подсказки");
        } finally {
            setLoadingQuestionId(null);
        }
    };

    const getHintText = (task, level) => {
        if (loadingTaskId === task.id) return "Думаем...";
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
        <>
        {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
        ))}
    </>
    );
};

export default TestPage;