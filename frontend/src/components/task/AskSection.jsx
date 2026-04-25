import React, { useState } from 'react';
import api from '../../utils/api';

const AskSection = ({ taskId }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!question.trim()) return;

        setLoading(true);

        try {
            const res = await api.post('/helpAi/ask/', {
                task_id: taskId,
                question,
            });

            setAnswer(res.data.answer);
        } catch (err) {
            alert('Ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="task-help task-help_ai">
            <div className="task-help__header">
                <div>
                    <h3 className="task-help__title text">Вопрос к ИИ</h3>
                    <p className="task-help__description description_text">
                        Сформулируйте вопрос по задаче. Ответ придет без раскрытия лишнего контекста.
                    </p>
                </div>
                <span className="task-help__badge text_mini">100 💰</span>
            </div>

            <div className="task-help__ask-row">
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Введите вопрос по задаче"
                    className="task-help__input description_text"
                />

                <button
                    type="button"
                    className="task-help__submit btn_text"
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                >
                    {loading ? 'Думаю...' : 'Спросить у ИИ'}
                </button>
            </div>

            {answer && (
                <div className="task-help__answer">
                    <div className="task-help__answer-title">Ответ</div>
                    <p className="task-help__answer-text description_text">{answer}</p>
                </div>
            )}
        </section>
    );
};

export default AskSection;
