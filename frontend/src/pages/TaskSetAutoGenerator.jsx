import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TaskSetAutoGenerator = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [subject, setSubject] = useState('');
    const [mode, setMode] = useState('full'); // 'full' | 'custom'
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [name, setName] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const resp = await api.get('/taskBank/tasks/');
                setTasks(resp.data);
            } catch (e) {
                console.error(e);
                setError('Не удалось загрузить банк заданий');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const subjects = [...new Set(tasks.map((t) => t.subject).filter(Boolean))];

    const availableNumbers = subject
        ? [...new Set(
            tasks
                .filter((t) => t.subject === subject && t.order_KIM != null)
                .map((t) => t.order_KIM),
        )].sort((a, b) => a - b)
        : [];

    const toggleNumber = (num) => {
        setSelectedNumbers((prev) =>
            prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject) {
            alert('Выберите предмет');
            return;
        }

        const payload = {
            subject,
            mode,
            task_numbers: mode === 'custom' ? selectedNumbers : [],
            name: name || undefined,
        };

        try {
            const resp = await api.post('/taskBank/tasksets/generate/', payload);
            const created = resp.data;
            if (created?.id) {
                navigate(`/tasksets/play/${created.id}`);
            } else {
                alert('Комплект сгенерирован, но не удалось определить его ID');
            }
        } catch (e) {
            console.error(e);
            const detail = e.response?.data?.detail || 'Ошибка при генерации комплекта';
            alert(detail);
        }
    };

    if (loading) {
        return <div>Загрузка данных для генерации комплекта...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Адаптивный вариант по статистике</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Название варианта (необязательно):{' '}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например: Тренировка по математике"
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Предмет:{' '}
                        <select
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value);
                                setSelectedNumbers([]);
                            }}
                        >
                            <option value="">Выберите предмет</option>
                            {subjects.map((subj) => (
                                <option key={subj} value={subj}>
                                    {subj}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <div>Режим создания комплекта:</div>
                    <label style={{ marginRight: '15px' }}>
                        <input
                            type="radio"
                            value="full"
                            checked={mode === 'full'}
                            onChange={() => setMode('full')}
                        />{' '}
                        Полный комплект по предмету
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="custom"
                            checked={mode === 'custom'}
                            onChange={() => setMode('custom')}
                            disabled={!subject}
                        />{' '}
                        Выбрать номера заданий КИМ
                    </label>
                </div>

                {mode === 'custom' && subject && (
                    <div style={{ marginBottom: '10px' }}>
                        <div>Номера заданий КИМ по предмету {subject}:</div>
                        {availableNumbers.length === 0 && (
                            <div>Для этого предмета нет заданий в банке.</div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {availableNumbers.map((num) => (
                                <label
                                    key={num}
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedNumbers.includes(num)}
                                        onChange={() => toggleNumber(num)}
                                        style={{ marginRight: '4px' }}
                                    />
                                    №{num}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" disabled={!subject || (mode === 'custom' && selectedNumbers.length === 0)}>
                    Сгенерировать и начать вариант
                </button>
            </form>
        </div>
    );
};

export default TaskSetAutoGenerator;

