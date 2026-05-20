import { useEffect, useState } from 'react';
import api from '../api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
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

  return { tasks, loading, error };
};