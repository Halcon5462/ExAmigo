import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Streak = () => {
  const [streak, setStreak] = useState({
    current: 0,
    lastActivityDate: null,
    loading: true
  });

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setStreak(prev => ({ ...prev, loading: false }));
          return;
        }

        const response = await axios.get('/api/streak/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStreak({
          current: response.data.current_streak,
          lastActivityDate: response.data.last_activity_date,
          loading: false
        });
      } catch (error) {
        console.error('Ошибка загрузки серии:', error);
        setStreak(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStreakData();
  }, []);

  const isActiveToday = () => {
    if (!streak.lastActivityDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return streak.lastActivityDate === today;
  };

  if (streak.loading) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '18px', color: isActiveToday() ? '#ff9500' : '#888' }}>🔥</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{streak.current}</span>
    </div>
  );
};

export default Streak;