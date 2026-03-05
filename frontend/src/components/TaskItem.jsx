import React, { useState } from "react";
import api from "../utils/api";

const TaskItem = ({ task, onAnswered }) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(0);

  const checkAnswer = async () => {
    if (!userAnswer.trim()) return;

    try {
      const response = await api.post(
        `/account/task-progress/${task.id}/submit/`,
        { answer: userAnswer }
      );

      const { correct, reward } = response.data;

      setResult(correct ? "correct" : "wrong");
      setReward(reward);

      // сообщаем родителю результат
      if (onAnswered) {
        onAnswered(task.id, userAnswer, correct);
      }

    } catch (err) {
      console.error("Ошибка проверки:", err);
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
          <img src={task.image} alt='Ошибка загрузки картинки' style={{maxHeight: '200px'}} />
      )}
      <div className="task-description" style={styles.desc}>
          {task.description}
      </div>
      {task.file && (
          <a download={task.file} style={{display: 'block'}} >
              <button>Скачать файл</button>
          </a>
      )}

      {task.image && (
        <img
          src={task.image}
          alt="task"
          style={{ maxHeight: "200px", marginBottom: "10px" }}
        />
      )}

      <p>{task.description}</p>

      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Введите ответ"
      />

      <button onClick={checkAnswer} style={{ marginLeft: "10px" }}>
        Проверить
      </button>

      {result === "correct" && (
        <p style={{ color: "green" }}>
          ✅ Верно! {reward > 0 && `+${reward} монет`}
        </p>
      )}

      {result === "wrong" && (
        <p style={{ color: "red" }}>
          ❌ Неверно
        </p>
      )}
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