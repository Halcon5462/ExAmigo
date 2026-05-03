import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import CreateTaskSetFilters from '../../components/Filter/CreateTaskSetFilters';
import { SUBJECT_OPTIONS } from '../../utils/subjectOptions';
import '../../static/css/taskSetCreator.css';

const TaskSetCreator = () => {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState({});
  const [name, setName] = useState('');
  const [setType, setSetType] = useState('training');
  const [subject, setSubject] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
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
        sorted.forEach(([id], idx) => {
          renumbered[id] = idx + 1;
        });
        return renumbered;
      }

      const maxOrder = Object.keys(prev).length;
      newSel[taskId] = maxOrder + 1;
      return newSel;
    });
  };

  const handleOrderChange = (taskId, value) => {
    const newOrder = Number(value);
    setSelected(prev => {
      const updated = { ...prev, [taskId]: newOrder };
      const sorted = Object.entries(updated).sort((a, b) => a[1] - b[1]);
      const renumbered = {};
      sorted.forEach(([id], idx) => {
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
      setSelected({});
      setFilters({});
    } catch (e) {
      console.error(e);
      alert('Ошибка при создании комплекта');
    }
  };

  if (loading) return <div className="taskset-creator-page taskset-creator-page_status">Загрузка заданий...</div>;
  if (error) return <div className="taskset-creator-page taskset-creator-page_status">{error}</div>;

  const selectedSubjectLabel = SUBJECT_OPTIONS.find(opt => opt.value === subject)?.label;
  const filteredTasks = (setType === 'training')
    ? tasks.filter(task => {
        if (
          subject &&
          task.subject !== subject &&
          task.subject !== selectedSubjectLabel &&
          task.subject_display !== selectedSubjectLabel
        ) {
          return false;
        }
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
    <div className="taskset-creator-page">
      <section className="taskset-creator-page__hero">
        <div className="taskset-creator-page__hero-copy">
          <span className="taskset-creator-page__eyebrow text_mini">Ручная сборка</span>
          <h1 className="taskset-creator-page__title text">Создание варианта</h1>
          <p className="taskset-creator-page__description description_text">
            Соберите тренировочный комплект вручную или сгенерируйте экзамен по выбранному предмету.
          </p>
        </div>

        <div className="taskset-creator-page__hero-note">
          <span className="taskset-creator-page__hero-note-value text">{Object.keys(selected).length}</span>
          <span className="taskset-creator-page__hero-note-label description_text">
            заданий в новом комплекте
          </span>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="taskset-creator-form">
        <div className="taskset-creator-form__grid">
          <label className="taskset-creator-form__field">
            <span className="taskset-creator-form__label text_mini">Название</span>
            <input
              className="taskset-creator-form__input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Например: Мой вариант по математике"
            />
          </label>

          <label className="taskset-creator-form__field">
            <span className="taskset-creator-form__label text_mini">Тип комплекта</span>
            <select className="taskset-creator-form__input" value={setType} onChange={e => setSetType(e.target.value)}>
              <option value="training">Тренировка</option>
              <option value="exam">Экзамен</option>
            </select>
          </label>

          <label className="taskset-creator-form__field">
            <span className="taskset-creator-form__label text_mini">Предмет</span>
            <select
              className="taskset-creator-form__input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required={setType === 'exam'}
            >
              <option value="">Выберите предмет</option>
              {SUBJECT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        {setType === 'training' && (
          <section className="taskset-creator-form__section">
            <div className="taskset-creator-form__section-head">
              <div>
                <div className="taskset-creator-form__section-title text">Подбор заданий</div>
                <p className="taskset-creator-form__section-text description_text">
                  Отфильтруйте банк и соберите порядок заданий для нового варианта.
                </p>
              </div>
              <div className="taskset-creator-form__counter text_mini">
                Выбрано: {Object.keys(selected).length}
              </div>
            </div>

            <CreateTaskSetFilters
              tasks={tasks}
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            {subject && (
              <p className="taskset-creator-form__filtered-count description_text">
                Показано заданий по предмету: {filteredTasks.length}
              </p>
            )}

            <div className="taskset-creator-form__actions">
              <button type="submit" className="taskset-creator-form__submit btn_text">
                {setType === 'exam' ? 'Сгенерировать экзамен' : 'Создать комплект'}
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="taskset-creator-form__empty description_text">
                Нет заданий, соответствующих фильтрам.
              </div>
            ) : (
              <div className="taskset-creator-table-wrap">
                <table className="taskset-creator-table">
                  <thead>
                    <tr>
                      <th>Выбрать</th>
                      <th>№</th>
                      <th>Предмет</th>
                      <th>Тип</th>
                      <th>Сложность</th>
                      <th>Порядок</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <input
                            className="taskset-creator-table__checkbox"
                            type="checkbox"
                            checked={selected[task.id] !== undefined}
                            onChange={() => toggleTask(task.id)}
                          />
                        </td>
                        <td>{task.order_KIM}</td>
                        <td>{task.subject_display || task.subject}</td>
                        <td>{task.type}</td>
                        <td>{task.difficulty}</td>
                        <td>
                          {selected[task.id] !== undefined ? (
                            <input
                              className="taskset-creator-table__order"
                              type="number"
                              min="1"
                              value={selected[task.id]}
                              onChange={e => handleOrderChange(task.id, e.target.value)}
                            />
                          ) : (
                            <span className="taskset-creator-table__muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {setType === 'exam' && (
          <section className="taskset-creator-form__section">
            <div className="taskset-creator-form__section-title text">Экзаменационный режим</div>
            <p className="taskset-creator-form__section-text description_text">
              В этом режиме система автоматически соберет комплект по выбранному предмету.
            </p>
          </section>
        )}
      </form>
    </div>
  );
};

export default TaskSetCreator;
