import React, { useState } from 'react';


const TaskItem = ({ task }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [result, setResult] = useState(null);

    const checkAnswer = () => {
        if (userAnswer.trim().toLowerCase() === task.answer.trim().toLowerCase()) {
            setResult('correct');
        } else {
            setResult('wrong');
        }
    };

    return (
        <div className="task-card" style={styles.card}>
            <div style={styles.header}>
                <strong>Задание №{task.order_KIM}</strong>
                <span style={styles.difficulty}>Сложность: {task.difficulty}/5</span>
            </div>
            <p className="task-type"><em>Тип: {task.type}</em></p>
            <div className="task-description" style={styles.desc}>
                {task.description}
            </div>

            <div style={styles.controls}>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Ваш ответ..."
                    style={styles.input}
                />
                <button onClick={checkAnswer} style={styles.btn}>Ответить</button>
            </div>

            {result === 'correct' && <p style={{color: 'green'}}>✅ Верно!</p>}
            {result === 'wrong' && <p style={{color: 'red'}}>❌ Попробуйте еще раз.</p>}
        </div>
    );
};

const styles = {
    card: { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    desc: { whiteSpace: 'pre-wrap', margin: '10px 0', lineHeight: '1.5' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' },
    btn: { padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default TaskItem;