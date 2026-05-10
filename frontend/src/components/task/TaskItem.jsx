import React, { useState } from "react";
import api from "../../utils/api";
import '../../static/css/task.css'

import HintSection from "./HintSection";
import AskSection from "./AskSection";

import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css';

const TaskItem = ({ task, onAnswered, examSessionId, locked, disabledByTime, initialAnswer, initialCorrect, prices }) => {
  const [userAnswer, setUserAnswer] = useState(initialAnswer || "");
  const [result, setResult] = useState(
    initialCorrect === true ? 'correct' : initialCorrect === false ? 'wrong' : null
  );
  const [reward, setReward] = useState(0);
  const [firstTime, setFirstTime] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const checkAnswer = async () => {
    if (locked || disabledByTime) return;
    if (!userAnswer.trim()) return;

    try {
        setErrorMsg(null);
        const payload = { answer: userAnswer };
        if (examSessionId) {
          payload.exam_session = examSessionId;
        }

        const response = await api.post(
            `/statistic/task-progress/${task.id}/submit/`,
            payload
        );

        const { correct, reward, first_time } = response.data;

        setResult(correct ? 'correct' : 'wrong');
        setReward(reward);
        setFirstTime(first_time);
        onAnswered?.(task.id, userAnswer, correct);

    } catch (err) {
        console.error("Ошибка проверки:", err);
        setErrorMsg(err?.response?.data?.error || "Ошибка проверки ответа");
        setResult(null);
        setReward(0);
        setFirstTime(null);
    }
  };

  const downloadFile = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        const fileName = url.split("/").pop();

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
        console.error("Ошибка скачивания:", error);
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
          <p style={{ whiteSpace: "pre-line" }}>{task.description}</p>
          {task.formula && (
            <BlockMath math={task.formula} />
          )}
      </div>
      {task.file && (
        <button onClick={() => downloadFile(task.file)}>
          Скачать файл
        </button>
      )}
      <div className="btn-container">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Введите ответ"
          className="input-answer"
          disabled={locked || disabledByTime}
        />
        <button onClick={checkAnswer} className="btn_text" disabled={locked || disabledByTime}>
          Проверить
        </button>
      </div>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      {result == 'correct' && (
          <p style={{color: 'green'}}>
              ✅ Верно! {reward > 0 && `Вы получили +${reward} монет.`}{" "}
              {firstTime == false && "Вы уже проходили эту задачу ранее."}
              Это {task.primary_score} первичных баллов
          </p>
      )}
      {result == 'wrong' && <p style={{color: 'red'}}>❌ Попробуйте еще раз.</p>}
      {task.already_solved && (
          <p style={{color: 'orange'}}>⚡ Вы уже проходили эту задачу ранее.</p>
      )}
      {!examSessionId && 
      <>
        <HintSection taskId={task.id} prices={prices} />
        <AskSection taskId={task.id} />
      </>
      }
    </div>
  );
};

export default TaskItem;
