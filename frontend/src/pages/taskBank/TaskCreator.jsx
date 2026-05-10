import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import '../../static/css/task.css';

const TaskCreator = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        subject: '',
        order_KIM: 1,
        type: '',
        difficulty: 1,
        description: '',
        correct_answers: '',
        image: null,
        file: null
    });

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
            .map((t) => [t.subject, t.subject_display || t.subject])
    ).entries()].map(([value, label]) => ({ value, label }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        data.append('subject', formData.subject);
        data.append('order_KIM', formData.order_KIM);
        data.append('type', formData.type);
        data.append('difficulty', formData.difficulty);
        data.append('description', formData.description);
        data.append('correct_answers', formData.correct_answers);

        if (formData.image) {
            data.append('image', formData.image);
        }
        if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            await api.post('/taskBank/tasks/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Успешно создано!');
            setFormData({
                subject: '',
                order_KIM: 1,
                type: '',
                difficulty: 1,
                description: '',
                correct_answers: '',
                image: null,
                file: null
            });
        } catch (err) {
            alert('Ошибка: ' + JSON.stringify(err.response?.data));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        const fieldValue = type === 'file' ? files[0] : value;
        setFormData(prev => ({ ...prev, [name]: fieldValue }));
    };

    if (loading) {
        return <div className="text_mini">Загрузка данных для создания задания...</div>;
    }

    if (error) {
        return <div className="text_mini">{error}</div>;
    }

    return (
        <div className="taskCreator">
            <h1 className="taskCreator_title text">Новое задание</h1>
            <form onSubmit={handleSubmit} className="taskCreator_form">
                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">
                        Предмет:{' '}
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="taskCreator_select description_text"
                            required
                        >
                            <option value="">Выберите предмет</option>
                            {subjects.map((subject) => (
                                <option key={subject.value} value={subject.value}>
                                    {subject.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* № КИМ */}
                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">№ КИМ</label>
                    <input
                        name="order_KIM"
                        type="number"
                        placeholder="№ КИМ"
                        onChange={handleChange}
                        value={formData.order_KIM}
                        className="taskCreator_input description_text"
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Тип задания</label>
                    <input
                        name="type"
                        placeholder="Тип задания"
                        onChange={handleChange}
                        value={formData.type}
                        className="taskCreator_input description_text"
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Сложность (1-5)</label>
                    <input
                        name="difficulty"
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Сложность (1-5)"
                        onChange={handleChange}
                        value={formData.difficulty}
                        className="taskCreator_input description_text"
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Условие задания</label>
                    <textarea
                        name="description"
                        placeholder="Условие задания"
                        onChange={handleChange}
                        value={formData.description}
                        className="taskCreator_textarea description_text"
                        rows={5}
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Изображение</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        className="taskCreator_file"
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Доп. файл</label>
                    <input
                        type="file"
                        name="file"
                        onChange={handleChange}
                        className="taskCreator_file"
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Верный ответ</label>
                    <input
                        name="correct_answers"
                        placeholder="Верный ответ"
                        onChange={handleChange}
                        value={formData.correct_answers}
                        className="taskCreator_input description_text"
                        required
                    />
                </div>

                <button type="submit" className="btn_green taskCreator_button">
                    Опубликовать
                </button>
            </form>
        </div>
    );
};

export default TaskCreator;