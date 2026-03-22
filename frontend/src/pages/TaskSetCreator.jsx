import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import CreateTaskSetFilters from '../components/Filter/CreateTaskSetFilters';
import { SUBJECT_OPTIONS } from '../utils/subjectOptions';

const TaskSetCreator = () => {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState({});
  const [name, setName] = useState('');
  const [setType, setSetType] = useState('training');
  const [subject, setSubject] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // В тренировке при смене предмета не смешиваем задания разных предметов в одном комплекте.
    if (setType !== 'training') return;
    setSelected({});
  }, [subject, setType]);

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
      setName('');
      setSetType('training');
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

  const selectedSubjectLabel = SUBJECT_OPTIONS.find(opt => opt.value === subject)?.label;
  // const visibleTasks =
  //   ? tasks.filter(t =>
  //       t.subject === subject
  //       || t.subject === selectedSubjectLabel
  //       || t.subject_display === selectedSubjectLabel
  //     )
  //   : tasks;
  const filteredTasks = (setType === 'training')
  ? tasks.filter(task => {
    if (filters.subject && task.subject !== filters.subject) return false;
    if (filters.orderKIM && String(task.order_KIM) !== filters.orderKIM) return false;
    if (filters.type && task.type !== filters.type) return false;
    if (filters.difficulty && String(task.difficulty) !== filters.difficulty) return false;
    if (filters.author) {
      const authorValue = task.author_name || task.author_email || String(task.author || '');
      if (authorValue !== filters.author) return false;
    }
    return true;
  })
  : tasks;

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
            <CreateTaskSetFilters
              tasks={tasks}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            {subject && (
              <p>Показано заданий по предмету: {filteredTasks.length}</p>
            )}
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
        {filteredTasks.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Нет заданий, соответствующих фильтрам</p>
        )}
        <button type="submit" style={{ marginTop: '15px' }}>
          {setType === 'exam' ? 'Сгенерировать экзамен' : 'Создать комплект'}
        </button>
      </form>
    </div>
  );
};

export default TaskSetCreator;
