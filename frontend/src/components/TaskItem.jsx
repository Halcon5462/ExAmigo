import React, { useState } from 'react';
import api from '../utils/api';


const TaskItem = ({ task }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [result, setResult] = useState(null);
    const [reward, setReward] = useState(0);
    const [firstTime, setFirstTime] = useState(null);

    const checkAnswer = async () => {
        if (!userAnswer.trim()) return;

        try {
            const response = await api.post(
                `/account/tasks-progress/${task.id}/submit/`,
                { answer: userAnswer }
            );

            const { correct, reward, first_time } = response.data;

            setResult(correct ? 'correct' : 'wrong');
            setReward(reward);
            setFirstTime(first_time);

        } catch (err) {
            console.error("Ошибка проверки:", err);
            setResult(null);
            setReward(0);
            setFirstTime(null);
        }
    };

    return (
        <div className="task-card" style={styles.card}>
            <div style={styles.header}>
                <strong>Задание №{task.order_KIM}</strong>
                <span style={styles.difficulty}>Сложность: {task.difficulty}/5</span>
            </div>
            <p className="task-type"><em>Тип: {task.type}</em></p>
            {task.image && (
                <img src={task.image} alt='Ошибка загрузки картинки' style={{height: '200px'}} />
            )}
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

            {result == 'correct' && (
                <p style={{color: 'green'}}>
                    ✅ Верно! {reward > 0 && `Вы получили +${reward} монет.`}{" "}
                    {firstTime == false && "Вы уже проходили эту задачу ранее."}
                </p>
            )}
            {result == 'wrong' && <p style={{color: 'red'}}>❌ Попробуйте еще раз.</p>}
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