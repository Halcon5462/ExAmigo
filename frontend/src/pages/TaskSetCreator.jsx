import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import CreateTaskSetFilters from '../components/Filter/CreateTaskSetFilters';

const TaskSetCreator = () => {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState({});
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.subject && task.subject !== filters.subject) return false;
    if (filters.orderKIM && String(task.order_KIM) !== filters.orderKIM) return false;
    if (filters.type && task.type !== filters.type) return false;
    if (filters.difficulty && String(task.difficulty) !== filters.difficulty) return false;
    if (filters.author) {
      const authorValue = task.author_name || task.author_email || String(task.author || '');
      if (authorValue !== filters.author) return false;
    }
    return true;
  });

  const toggleTask = (taskId) => {
    setSelected(prev => {
      const newSel = { ...prev };
      if (newSel[taskId]) {
        delete newSel[taskId];
        const sorted = Object.entries(newSel).sort((a, b) => a[1] - b[1]);
        const renumbered = {};
        sorted.forEach(([id, order], idx) => {
          renumbered[id] = idx + 1;
        });
        return renumbered;
      } else {
        const maxOrder = Object.keys(prev).length;
        newSel[taskId] = maxOrder + 1;
        return newSel;
      }
    });
  };

  const handleOrderChange = (taskId, value) => {
    const newOrder = Number(value);
    setSelected(prev => {
      const updated = { ...prev, [taskId]: newOrder };
      const sorted = Object.entries(updated).sort((a, b) => a[1] - b[1]);
      const renumbered = {};
      sorted.forEach(([id, order], idx) => {
        renumbered[id] = idx + 1;
      });
      return renumbered;
    });
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
      setName('');
      setSubject('');
      setIsPublic(false);
      setSelected({});
      setFilters({});
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

        <CreateTaskSetFilters
          tasks={tasks}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%', marginTop: '15px' }}>
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
            {filteredTasks.map(task => (
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
                      max={Object.keys(selected).length}
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

        {filteredTasks.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Нет заданий, соответствующих фильтрам</p>
        )}

        <button type="submit" style={{ marginTop: '15px', padding: '10px', cursor: 'pointer' }}>Создать комплект</button>
      </form>
    </div>
  );
};

export default TaskSetCreator;