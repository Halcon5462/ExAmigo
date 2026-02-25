import React, { useState } from 'react';


const TaskCreator = () => {
    const [formData, setFormData] = useState({
        subject: '',
        order_KIM: 1,
        type: '',
        difficulty: 1,
        description: '',
        answer: ''
    });

    const [statusMessage, setStatusMessage] = useState('');


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        setStatusMessage('Отправка...');

        try {
            const response = await fetch('http://localhost:8000/api/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatusMessage('Задание успешно создано!');
                setFormData({
                    subject: '', order_KIM: 1, type: '', difficulty: 1, description: '', answer: ''
                });
            } else {
                const errorData = await response.json();
                console.error("Ошибки валидации DRF:", errorData);
                setStatusMessage('Ошибка при создании задания. Проверьте консоль.');
            }
        } catch (error) {
            console.error("Сетевая ошибка:", error);
            setStatusMessage('Сетевая ошибка при обращении к серверу.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Создать новое задание</h2>
            <form onSubmit={handleSubmit} style={styles.form}>

                <label>Предмет:</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleChange} />

                <label>Номер задания из КИМ:</label>
                <input required type="number" min="1" name="order_KIM" value={formData.order_KIM} onChange={handleChange} />

                <label>Тип задания:</label>
                <input required type="text" name="type" value={formData.type} onChange={handleChange} />

                <label>Сложность (1-5):</label>
                <input required type="number" min="1" max="5" name="difficulty" value={formData.difficulty} onChange={handleChange} />

                <label>Описание задания:</label>
                <textarea required name="description" rows="5" value={formData.description} onChange={handleChange}></textarea>

                <label>Правильный ответ:</label>
                <input required type="text" name="answer" value={formData.answer} onChange={handleChange} />

                <button type="submit" style={styles.submitBtn}>Создать задание</button>
            </form>

            {statusMessage && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{statusMessage}</p>}
        </div>
    );
};

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    submitBtn: { padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }
};

export default TaskCreator;