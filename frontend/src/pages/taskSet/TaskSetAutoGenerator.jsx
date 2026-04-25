import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../static/css/taskSetAutoGenerator.css';

const TaskSetAutoGenerator = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [subject, setSubject] = useState('');
    const [mode, setMode] = useState('full');
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

    const subjects = [...new Map(
        tasks
            .filter((t) => t.subject)
            .map((t) => [t.subject, t.subject_display || t.subject]),
    ).entries()].map(([value, label]) => ({ value, label }));
    const selectedSubjectLabel = subjects.find((item) => item.value === subject)?.label || subject;

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
        return <div className="adaptive-generator-page adaptive-generator-page_status">Загрузка данных для генерации комплекта...</div>;
    }

    if (error) {
        return <div className="adaptive-generator-page adaptive-generator-page_status">{error}</div>;
    }

    return (
        <div className="adaptive-generator-page">
            <section className="adaptive-generator-page__hero">
                <div className="adaptive-generator-page__hero-copy">
                    <span className="adaptive-generator-page__eyebrow text_mini">Персональная сборка</span>
                    <h1 className="adaptive-generator-page__title text">Адаптивный вариант по статистике</h1>
                    <p className="adaptive-generator-page__description description_text">
                        Выберите предмет и режим генерации. Система соберет вариант на основе доступных заданий и сразу откроет его для решения.
                    </p>
                </div>

                <div className="adaptive-generator-page__hero-note">
                    <span className="adaptive-generator-page__hero-note-value text">{availableNumbers.length}</span>
                    <span className="adaptive-generator-page__hero-note-label description_text">
                        доступных номеров для выбранного предмета
                    </span>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="adaptive-generator-form">
                <div className="adaptive-generator-form__grid">
                    <label className="adaptive-generator-form__field">
                        <span className="adaptive-generator-form__label text_mini">Название варианта</span>
                        <input
                            type="text"
                            className="adaptive-generator-form__input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например: Тренировка по математике"
                        />
                    </label>

                    <label className="adaptive-generator-form__field">
                        <span className="adaptive-generator-form__label text_mini">Предмет</span>
                        <select
                            className="adaptive-generator-form__input"
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value);
                                setSelectedNumbers([]);
                            }}
                        >
                            <option value="">Выберите предмет</option>
                            {subjects.map((subj) => (
                                <option key={subj.value} value={subj.value}>
                                    {subj.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="adaptive-generator-form__section">
                    <div className="adaptive-generator-form__section-title text">Режим создания комплекта</div>
                    <div className="adaptive-generator-form__mode-list">
                        <label className={`adaptive-generator-form__mode ${mode === 'full' ? 'adaptive-generator-form__mode_active' : ''}`}>
                            <input
                                type="radio"
                                value="full"
                                checked={mode === 'full'}
                                onChange={() => setMode('full')}
                            />
                            <span className="description_text">Полный комплект по предмету</span>
                        </label>

                        <label className={`adaptive-generator-form__mode ${mode === 'custom' ? 'adaptive-generator-form__mode_active' : ''}`}>
                            <input
                                type="radio"
                                value="custom"
                                checked={mode === 'custom'}
                                onChange={() => setMode('custom')}
                                disabled={!subject}
                            />
                            <span className="description_text">Выбрать номера заданий КИМ</span>
                        </label>
                    </div>
                </div>

                {mode === 'custom' && subject && (
                    <div className="adaptive-generator-form__section">
                        <div className="adaptive-generator-form__section-head">
                            <div>
                                <div className="adaptive-generator-form__section-title text">Номера заданий КИМ</div>
                                <p className="adaptive-generator-form__section-text description_text">
                                    Выбран предмет: {selectedSubjectLabel}
                                </p>
                            </div>
                            <div className="adaptive-generator-form__counter text_mini">
                                Выбрано: {selectedNumbers.length}
                            </div>
                        </div>

                        {availableNumbers.length === 0 && (
                            <div className="adaptive-generator-form__empty description_text">
                                Для этого предмета пока нет заданий в банке.
                            </div>
                        )}

                        <div className="adaptive-generator-form__chips">
                            {availableNumbers.map((num) => (
                                <label
                                    key={num}
                                    className={`adaptive-generator-form__chip ${selectedNumbers.includes(num) ? 'adaptive-generator-form__chip_active' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedNumbers.includes(num)}
                                        onChange={() => toggleNumber(num)}
                                    />
                                    <span>№{num}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="adaptive-generator-form__actions">
                    <button
                        type="submit"
                        className="adaptive-generator-form__submit btn_text"
                        disabled={!subject || (mode === 'custom' && selectedNumbers.length === 0)}
                    >
                        Сгенерировать и начать вариант
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskSetAutoGenerator;
