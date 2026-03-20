import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TaskSetListFilters from '../components/Filter/TaskSetListFilters';

const TaskSetList = () => {
  const [tasksets, setTasksets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTaskSets = tasksets.filter(ts => {
    if (filters.testType && ts.subject !== filters.testType) return false;
    if (filters.difficulty) {
      const avgDiff = Math.round(ts.average_difficulty);
      if (String(avgDiff) !== filters.difficulty) return false;
    }
    if (filters.taskCount && String(ts.items?.length || 0) !== filters.taskCount) return false;
    if (filters.author) {
      const authorValue = ts.author_name || ts.author_email || String(ts.author || '');
      if (authorValue !== filters.author) return false;
    }
    if (filters.kimTasks === 'true' && !ts.kim_tasks) return false;
    if (filters.kimTasks === 'false' && ts.kim_tasks) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!ts.name.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  if (loading) return <div>Загрузка комплектов...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Список комплектов заданий</h2>

      <TaskSetListFilters
        taskSets={tasksets}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {filteredTaskSets.length === 0 && <p>Нет доступных комплектов.</p>}

      {filteredTaskSets.map(set => (
        <div key={set.id} style={{ border: '1px solid #ddd', marginBottom: '15px', padding: '10px' }}>
          <h3>{set.name}</h3>
          {set.subject && <p><strong>Предмет:</strong> {set.subject}</p>}
          <p><strong>Автор:</strong> {set.author_name || set.author_email || 'Аноним'}</p>
          <p><strong>Публичный:</strong> {set.is_public ? 'Да' : 'Нет'}</p>
          <p><strong>Заданий:</strong> {set.items?.length || 0}</p>
          <button onClick={() => navigate(`/tasksets/play/${set.id}`)}>Начать</button>
        </div>
      ))}
    </div>
  );
};

export default TaskSetList;