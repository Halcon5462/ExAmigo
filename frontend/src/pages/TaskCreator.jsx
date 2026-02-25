import React, { useState } from 'react';
import api from '../utils/api';


const TaskCreator = () => {
    const [formData, setFormData] = useState({
        subject: '',
        order_KIM: 1,
        type: '',
        difficulty: 1,
        description: '',
        answer: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', formData);
            alert('Задание создано!');
            setFormData({ subject: '', order_KIM: 1, type: '', difficulty: 1, description: '', answer: '' });
        } catch (err) {
            alert('Ошибка при сохранении: ' + JSON.stringify(err.response?.data));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                <input name="answer" placeholder="Верный ответ" onChange={handleChange} value={formData.answer} required />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Опубликовать</button>
            </form>
        </div>
    );
};

export default TaskCreator;