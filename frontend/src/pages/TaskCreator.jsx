import React, { useState } from 'react';
import api from '../utils/api';
import '../static/css/task.css';

const TaskCreator = () => {
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
        } catch (err) {
            alert('Ошибка: ' + JSON.stringify(err.response?.data));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        const fieldValue = type === 'file' ? files[0] : value;
        setFormData(prev => ({ ...prev, [name]: fieldValue }));
    };

    return (
        <div className="taskCreator">
            <h1 className="taskCreator_title text">Новое задание</h1>

            <form onSubmit={handleSubmit} className="taskCreator_form">
                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Предмет</label>
                    <input
                        name="subject"
                        className="taskCreator_input description_text"
                        placeholder="Предмет"
                        onChange={handleChange}
                        value={formData.subject}
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Тип задания</label>
                    <input
                        name="type"
                        className="taskCreator_input description_text"
                        placeholder="Тип задания"
                        onChange={handleChange}
                        value={formData.type}
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Условие задания</label>
                    <textarea
                        name="description"
                  http://localhost:5173/tasks/create      className="taskCreator_textarea description_text"
                        placeholder="Условие задания"
                        onChange={handleChange}
                        value={formData.description}
                        rows={6}
                        required
                    />
                </div>

                <div className="taskCreator_field">
                    <label className="taskCreator_label description_text">Верный ответ</label>
                    <input
                        name="correct_answers"
                        className="taskCreator_input description_text"
                        placeholder="Верный ответ"
                        onChange={handleChange}
                        value={formData.correct_answers}
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