import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const TaskSetCreator = () => {
  const SUBJECT_OPTIONS = [
    { value: 'prof_math', label: 'Профильная математика' },
    { value: 'russian', label: 'Русский язык' },
    { value: 'physics', label: 'Физика' },
    { value: 'informatic', label: 'Информатика' },
  ];

  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState({}); // {taskId: order}
  const [name, setName] = useState('');
  const [setType, setSetType] = useState('training');
  const [subject, setSubject] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const resp = await api.get('/taskBank/tasks/');
        setTasks(resp.data);
      } catch (e) {
        console.error(e);
        setError('Не удалось загрузить задания');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const toggleTask = (taskId) => {
    setSelected(prev => {
      const newSel = { ...prev };
      if (newSel[taskId]) {
        delete newSel[taskId];
      } else {
        newSel[taskId] = Object.keys(prev).length + 1; // default order
      }
      return newSel;
    });
  };

  const handleOrderChange = (taskId, value) => {
    setSelected(prev => ({ ...prev, [taskId]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (setType === 'exam') {
        if (!subject) {
          alert('Выберите предмет');
          return;
        }
        const payload = {
          name,
          subject,
          is_public: isPublic,
        };
        await api.post('/taskBank/tasksets/generate-exam/', payload);
        alert('Экзамен создан');
      } else {
        const items = Object.entries(selected).map(([taskId, order]) => ({ task: Number(taskId), order }));
        const payload = {
          name,
          type: setType,
          subject: subject || null,
          is_public: isPublic,
          items,
        };
        await api.post('/taskBank/tasksets/', payload);
        alert('Комплект создан');
      }
      // reset form
      setName('');
      setSetType('training');
      setSubject('');
      setIsPublic(false);
      setSelected({});
    } catch (e) {
      console.error(e);
      alert('Ошибка при создании комплекта');
    }
  };

  if (loading) return <div>Загрузка заданий...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Создать комплект заданий</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название: </label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Тип: </label>
          <select value={setType} onChange={e => setSetType(e.target.value)}>
            <option value="training">Тренировка</option>
            <option value="exam">Экзамен</option>
          </select>
        </div>
        <div>
          <label>Предмет: </label>
          <select value={subject} onChange={e => setSubject(e.target.value)} required={setType === 'exam'}>
            <option value="">--</option>
            {SUBJECT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Публичный: </label>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        </div>
        {setType === 'training' && (
          <>
            <h3>Выберите задания</h3>
            <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Выбрать</th>
                  <th>№</th>
                  <th>Предмет</th>
                  <th>Тип</th>
                  <th>Сложность</th>
                  <th>Порядок в комплекте</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected[task.id] !== undefined}
                        onChange={() => toggleTask(task.id)}
                      />
                    </td>
                    <td>{task.order_KIM}</td>
                    <td>{task.subject}</td>
                    <td>{task.type}</td>
                    <td>{task.difficulty}</td>
                    <td>
                      {selected[task.id] !== undefined && (
                        <input
                          type="number"
                          min="1"
                          value={selected[task.id]}
                          onChange={e => handleOrderChange(task.id, e.target.value)}
                          style={{ width: '60px' }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <button type="submit" style={{ marginTop: '15px' }}>
          {setType === 'exam' ? 'Сгенерировать экзамен' : 'Создать комплект'}
        </button>
      </form>
    </div>
  );
};

export default TaskSetCreator;
