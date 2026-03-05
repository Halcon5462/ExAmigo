import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TaskSetPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentSet, setCurrentSet] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState({});  // { taskId: string }
  const [checked, setChecked] = useState({});  // { taskId: boolean }
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState('playing'); // 'playing' | 'stats'

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const resp = await api.get(`/taskBank/tasksets/${id}/`);
        const set = resp.data;
        const sorted = [...(set.items || [])].sort((a, b) => a.order - b.order);
        const taskDetails = await Promise.all(
          sorted.map(item =>
            api.get(`/taskBank/tasks/${item.task}/`).then(r => ({
              ...r.data,
              _order: item.order,
            }))
          )
        );
        setCurrentSet(set);
        setTasks(taskDetails);
      } catch (e) {
        console.error(e);
        setError('Не удалось загрузить комплект заданий');
      } finally {
        setLoading(false);
      }
    };
    fetchSet();
  }, [id]);

  const checkAnswer = async () => {
    const task = tasks[taskIndex];
    if (!currentInput.trim()) return;

    try {
      const resp = await api.post(`/task-progress/${task.id}/submit/`, {
        answer: currentInput.trim(),
      });

      const data = resp.data;

      setChecked(prev => ({
        ...prev,
        [task.id]: data.correct,
      }));

      setAnswers(prev => ({
        ...prev,
        [task.id]: currentInput.trim(),
      }));

      if (data.first_time) {
        console.log(`Получена награда: ${data.reward}`);
      }

    } catch (error) {
      console.error("Ошибка отправки ответа:", error);
    }
  };

  const goTo = (index) => {
    setTaskIndex(index);
    setCurrentInput(answers[tasks[index]?.id] || '');
  };

  const retry = () => {
    setAnswers({});
    setChecked({});
    setTaskIndex(0);
    setCurrentInput('');
    setScreen('playing');
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  // тут статистика
  if (screen === 'stats') {
    const total = tasks.length;
    const correctCount = Object.values(checked).filter(Boolean).length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div style={{ padding: '20px' }}>
        <h2>Результаты: {currentSet?.name}</h2>
        <p>Верных ответов: {correctCount} из {total} ({pct}%)</p>

        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>№</th>
              <th>Предмет</th>
              <th>Тип</th>
              <th>Сложность</th>
              <th>Ваш ответ</th>
              <th>Верный ответ</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => {
              const isCorrect = checked[task.id];
              const userAns = answers[task.id];
              const correctAnswers = (task.correct_answers || [])
                .map(a => a.answer_text)
                .join(', ');
              return (
                <tr key={task.id}>
                  <td>{task._order ?? i + 1}</td>
                  <td>{task.subject}</td>
                  <td>{task.type}</td>
                  <td>{task.difficulty}</td>
                  <td>{userAns ?? '—'}</td>
                  <td>{correctAnswers}</td>
                  <td>
                    {userAns !== undefined
                      ? isCorrect ? 'Верно' : 'Неверно'
                      : 'Не отвечено'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <br />
        <button onClick={retry}>Пройти снова</button>
        {' '}
        <button onClick={() => navigate('/tasksets')}>К списку вариантов</button>
      </div>
    );
  }

  // тут прохождение
  const task = tasks[taskIndex];
  const isChecked = checked[task?.id] !== undefined;
  const isCorrect = checked[task?.id];
  const correctAnswers = (task?.correct_answers || []).map(a => a.answer_text).join(', ');

  return (
    <div style={{ padding: '20px' }}>
      <h2>{currentSet?.name}</h2>
      <p>Задание {taskIndex + 1} из {tasks.length}</p>

      {task && (
        <div>
          <p>
            <strong>№{task._order ?? taskIndex + 1}</strong>
            {' | '}Предмет: {task.subject}
            {' | '}Тип: {task.type}
            {' | '}Сложность: {task.difficulty}
          </p>
          <p>{task.description}</p>

          <input
            type="text"
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isChecked) checkAnswer(); }}
            disabled={isChecked}
            placeholder="Введите ответ"
          />
          {!isChecked && (
            <button onClick={checkAnswer}>Проверить</button>
          )}

          {isChecked && (
            <p>
              {isCorrect
                ? 'Верно!'
                : `Неверно. Правильный ответ: ${correctAnswers}`}
            </p>
          )}
        </div>
      )}

      <br />
      <button onClick={() => goTo(taskIndex - 1)} disabled={taskIndex === 0}>
        Назад
      </button>
      {' '}
      {taskIndex < tasks.length - 1 ? (
        <button onClick={() => goTo(taskIndex + 1)}>Далее</button>
      ) : (
        <button onClick={() => setScreen('stats')}>Завершить вариант</button>
      )}
    </div>
  );
};

export default TaskSetPlayer;