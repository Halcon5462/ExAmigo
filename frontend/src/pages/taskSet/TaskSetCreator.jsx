import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import { SUBJECT_OPTIONS } from '../../utils/subjectOptions';

import CreateTaskSetFilters from '../../components/Filter/CreateTaskSetFilters';
import { TaskTable } from '../../components/taskBank/TaskTable';
import { TaskSetHero } from '../../components/taskBank/TaskSetHero';
import { ExamInfo } from '../../components/taskBank/ExamInfo';

import { useTasks } from '../../utils/taskSetCreator/useTasks';
import { useSelection } from '../../utils/taskSetCreator/useSelection';
import { useFilters } from '../../utils/taskSetCreator/useFilters';

import '../../static/css/taskSetCreator.css';

const TaskSetCreator = () => {
  const navigate = useNavigate();

  const { tasks, loading, error } = useTasks();
  const { selected, toggleTask, changeOrder, reset } = useSelection();
  const { filters, handleFilterChange } = useFilters();

  const [name, setName] = useState('');
  const [setType, setSetType] = useState('training');
  const [subject, setSubject] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (setType === 'training') reset();
  }, [subject, setType]);

  const selectedSubjectLabel =
    SUBJECT_OPTIONS.find(opt => opt.value === subject)?.label;

  const filteredTasks =
    setType === 'training'
      ? tasks.filter(task => {
          if (
            subject &&
            task.subject !== subject &&
            task.subject !== selectedSubjectLabel &&
            task.subject_display !== selectedSubjectLabel
          ) return false;

          if (filters.orderKIM && String(task.order_KIM) !== filters.orderKIM)
            return false;

          if (filters.type && task.type !== filters.type) return false;

          if (
            filters.difficulty &&
            String(task.difficulty) !== filters.difficulty
          )
            return false;

          if (filters.author) {
            const author =
              task.author_name ||
              task.author_email ||
              String(task.author || '');

            if (author !== filters.author) return false;
          }

          return true;
        })
      : tasks;

  if (loading)
    return (
      <div className="taskset-creator-page taskset-creator-page_status">
        Загрузка заданий...
      </div>
    );

  if (error)
    return (
      <div className="taskset-creator-page taskset-creator-page_status">
        {error}
      </div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let resp;

      if (setType === 'exam') {
        if (!subject) {
          alert('Выберите предмет');
          return;
        }

        resp = await api.post('/taskBank/tasksets/generate-exam/', {
          name,
          subject,
          is_public: isPublic,
        });

        alert('Экзамен создан');
        await startExam(resp.data.id);
      } else {
        const items = Object.entries(selected).map(([taskId, order]) => ({
          task: Number(taskId),
          order,
        }));

        resp = await api.post('/taskBank/tasksets/', {
          name,
          type: setType,
          subject: subject || null,
          is_public: isPublic,
          items,
        });

        alert('Комплект создан');

        if (resp.data?.id) {
          navigate(`/tasksets/play/${resp.data.id}`);
        }
      }

      setName('');
      setSetType('training');
      setSubject('');
      reset();
      handleFilterChange({}, {});
    } catch (e) {
      console.error(e);
      alert('Ошибка при создании комплекта');
    }
  };

  const startExam = async (setId) => {
    const resp = await api.post(
      `/taskBank/tasksets/${setId}/start-exam/`
    );

    navigate(
      `/tasksets/play/${setId}?exam=${resp.data?.exam_id}`
    );
  };

  return (
    <div className="taskset-creator-page">
      <TaskSetHero selectedCount={Object.keys(selected).length} />

      <form onSubmit={handleSubmit} className="taskset-creator-form">
        <div className="taskset-creator-form__grid">
          <label className="taskset-creator-form__field">
            <span className="taskset-creator-form__label text_mini">
              Название
            </span>

            <input
              className="taskset-creator-form__input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>

          <label className="taskset-creator-form__field">
            <span className="taskset-creator-form__label text_mini">
              Тип комплекта
            </span>

            <select
              className="taskset-creator-form__input"
              value={setType}
              onChange={e => setSetType(e.target.value)}
            >
              <option value="training">Тренировка</option>
              <option value="exam">Экзамен</option>
            </select>
          </label>

          <label className="taskset-creator-form__field">
            <span className="taskset-creator-form__label text_mini">
              Предмет
            </span>

            <select
              className="taskset-creator-form__input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              <option value="">Выберите предмет</option>
              {SUBJECT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="taskset-creator-form__actions">
            <button
              type="submit"
              className="taskset-creator-form__submit btn_text"
            >
              {setType === 'exam'
                ? 'Сгенерировать экзамен'
                : 'Создать комплект'}
            </button>
          </div>
        </div>

        {setType === 'training' && (
          <section className="taskset-creator-form__section">
            <div className="taskset-creator-form__section-head">
              <div>
                <div className="taskset-creator-form__section-title text">
                  Подбор заданий
                </div>

                <p className="taskset-creator-form__section-text description_text">
                  Отфильтруйте банк и соберите порядок заданий для нового
                  варианта.
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

            {filteredTasks.length === 0 ? (
              <div className="taskset-creator-form__empty description_text">
                Нет заданий, соответствующих фильтрам.
              </div>
            ) : (
              <TaskTable
                tasks={filteredTasks}
                selected={selected}
                toggleTask={toggleTask}
                handleOrderChange={changeOrder}
              />
            )}
          </section>
        )}

        {setType === 'exam' && <ExamInfo />}
      </form>
    </div>
  );
};

export default TaskSetCreator;