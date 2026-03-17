import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TaskSetList = () => {
  const [tasksets, setTasksets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const startExam = async (setId) => {
    try {
      const resp = await api.post(`/taskBank/tasksets/${setId}/start-exam/`);
      const examId = resp.data?.exam_id;
      navigate(`/tasksets/play/${setId}?exam=${examId}`);
    } catch (e) {
      console.error(e);
      alert('Не удалось начать экзамен');
    }
  };

  useEffect(() => {
    const fetchTaskSets = async () => {
      try {
        const resp = await api.get('/taskBank/tasksets/');
        setTasksets(resp.data);
      } catch (e) {
        console.error(e);
        setError('Не удалось загрузить комплекты заданий');
      } finally {
        setLoading(false);
      }
    };
    fetchTaskSets();
  }, []);

  if (loading) return <div>Загрузка комплектов...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Список комплектов заданий</h2>
      {tasksets.length === 0 && <p>Нет доступных комплектов.</p>}
      {tasksets.map(set => (
        <div key={set.id} style={{ border: '1px solid #ddd', marginBottom: '15px', padding: '10px' }}>
          <h3>{set.name}</h3>
          <p><strong>Тип:</strong> {set.type}</p>
          {set.subject && <p><strong>Предмет:</strong> {set.subject}</p>}
          <p><strong>Автор:</strong> {set.author_name || set.author_email || 'Аноним'}</p>
          <p><strong>Публичный:</strong> {set.is_public ? 'Да' : 'Нет'}</p>
          <p><strong>Заданий:</strong> {set.items?.length || 0}</p>
          {set.type === 'exam' ? (
            <button onClick={() => startExam(set.id)}>Начать экзамен</button>
          ) : (
            <button onClick={() => navigate(`/tasksets/play/${set.id}`)}>Начать</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskSetList;
