import React, { useState } from 'react';


const TaskItem = ({ task }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [status, setStatus] = useState(null);

    const handleCheckAnswer = () => {
        if (userAnswer.trim().toLowerCase() === task.answer.trim().toLowerCase()) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h4>Задание №{task.order_KIM}</h4>
                <span style={styles.badge}>Сложность: {task.difficulty}/5</span>
            </div>

            <p style={styles.description}>{task.description}</p>

            <div style={styles.interactionArea}>
                <input
                    type="text"
                    placeholder="Введите ответ..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleCheckAnswer} style={styles.button}>Проверить</button>
            </div>

            {status === 'success' && <p style={{color: 'green'}}>Верно!</p>}
            {status === 'error' && <p style={{color: 'red'}}>Неверно, попробуйте еще раз.</p>}
        </div>
    );
};

const styles = {
    card: { border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { background: '#eee', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' },
    description: { whiteSpace: 'pre-wrap', margin: '15px 0' },
    interactionArea: { display: 'flex', gap: '10px' },
    input: { padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '8px 15px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }
};

export default TaskItem;