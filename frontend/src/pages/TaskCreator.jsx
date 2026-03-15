import React, { useState } from 'react';
import api from '../utils/api';


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

        setFormData(prev => ({
            ...prev,
            [name]: fieldValue
        }));
    };

    return (
        <div style={{ maxWidth: '500px' }}>
            <h1>Новое задание</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input name="subject" placeholder="Предмет" onChange={handleChange} value={formData.subject} required />
                <input name="order_KIM" type="number" placeholder="№ КИМ" onChange={handleChange} value={formData.order_KIM} required />
                <input name="type" placeholder="Тип задания" onChange={handleChange} value={formData.type} required />
                <input name="difficulty" type="number" min="1" max="5" placeholder="Сложность (1-5)" onChange={handleChange} value={formData.difficulty} required />
                <textarea name="description" placeholder="Условие задания" onChange={handleChange} value={formData.description} required rows={5} />
                <label>Изображение:</label>
                <input type="file" name="image" onChange={handleChange} />
                <label>Доп. файл:</label>
                <input type="file" name="file" onChange={handleChange} />
                <input name="correct_answers" placeholder="Верный ответ" onChange={handleChange} value={formData.correct_answers} required />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Опубликовать</button>
            </form>
        </div>
    );
};

export default TaskCreator;