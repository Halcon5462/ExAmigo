import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const HintSection = ({ taskId, prices }) => {
    const [hints, setHints] = useState({});
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGetHint = async (level) => {
        if (hints[level]) {
            setSelectedLevel(level);
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/helpAi/hint/', {
                task_id: taskId,
                level,
            });

            setHints((prev) => ({
                ...prev,
                [level]: res.data.hint,
            }));

            setSelectedLevel(level);
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const getMeta = (level) => {
        if (loading) return 'Думаем...';
        if (hints[level]) return 'Открыто';
        return `-${prices[level] ?? '?'} 💰`;
    };

    return (
        <section className="task-help task-help_hints">
            <div className="task-help__header">
                <div>
                    <h3 className="task-help__title text">Подсказки</h3>
                    <p className="task-help__description description_text">
                        Открывайте подсказки по уровням, если хотите двигаться к решению постепенно.
                    </p>
                </div>
            </div>

            <div className="task-help__actions">
                {[1, 2, 3].map((level) => (
                    <button
                        key={level}
                        type="button"
                        className={`task-help__chip ${selectedLevel === level ? 'task-help__chip_active' : ''}`}
                        onClick={() => handleGetHint(level)}
                    >
                        <span>Уровень {level}</span>
                        <span className="task-help__chip-meta">{getMeta(level)}</span>
                    </button>
                ))}
            </div>

            {Object.keys(hints).length > 0 && (
                <div className="task-help__content">
                    {Object.entries(hints).map(([lvl, text]) => (
                        <article
                            key={lvl}
                            className={`task-help__card ${Number(selectedLevel) === Number(lvl) ? 'task-help__card_active' : ''}`}
                        >
                            <div className="task-help__card-title">Уровень {lvl}</div>
                            <p className="task-help__card-text description_text">{text}</p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default HintSection;
