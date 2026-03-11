import React, { useState } from "react";
import api from "../utils/api";
import '../static/css/task.css'

const TaskItem = ({ task }) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(0);
  const [firstTime, setFirstTime] = useState(null);

  const checkAnswer = async () => {
    if (!userAnswer.trim()) return;

    try {
        const response = await api.post(
            `/account/task-progress/${task.id}/submit/`,
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
    <div className="task-card">
      <div className='text_mini'>
          <span>Сложность: {task.difficulty}/5</span>
      </div>
      <p className="task-type text_mini">Тип: {task.type}</p>
      {task.image && (
        <div className="image-container">
          <img src={task.image} alt='Ошибка загрузки картинки'/>
        </div>
      )}
      <div className="task-description description_text">
          {task.description}
      </div>
      {task.file && (
          <a href={task.file} download target="_blank" rel="noopener noreferrer">
              <button>Скачать файл</button>
          </a>
      )}
      <div className="btn-container">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Введите ответ"
          className="input-answer"
        />
        <button onClick={checkAnswer} className="btn_text">
          Проверить
        </button>
      </div>

      {result == 'correct' && (
          <p style={{color: 'green'}}>
              ✅ Верно! {reward > 0 && `Вы получили +${reward} монет.`}{" "}
              {firstTime == false && "Вы уже проходили эту задачу ранее."}
          </p>
      )}
      {result == 'wrong' && <p style={{color: 'red'}}>❌ Попробуйте еще раз.</p>}
      {task.already_solved && (
          <p style={{color: 'orange'}}>⚡ Вы уже проходили эту задачу ранее.</p>
      )}
    </div>
  );
};

export default TaskItem;