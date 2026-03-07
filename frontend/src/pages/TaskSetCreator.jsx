import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const TaskSetCreator = () => {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState({}); // {taskId: order}
  const [name, setName] = useState('');
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
    const items = Object.entries(selected).map(([taskId, order]) => ({ task: Number(taskId), order }));
    const payload = {
      name,
      subject: subject || null,
      is_public: isPublic,
      items,
    };
    try {
      await api.post('/taskBank/tasksets/', payload);
      alert('Комплект создан');
      // reset form
      setName('');
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
          <label>Предмет (необязательно): </label>
          <input value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label>Публичный: </label>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        </div>
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
        <button type="submit" style={{ marginTop: '15px' }}>Создать комплект</button>
      </form>
    </div>
  );
};

export default TaskSetCreator;
