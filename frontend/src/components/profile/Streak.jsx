import React, { useState, useEffect } from 'react';
import api from "../../utils/api";

const Streak = () => {
  const [streak, setStreak] = useState({
    current: 0,
    lastActivityDate: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setStreak(prev => ({ ...prev, loading: false }));
      return;
    }

    let mounted = true;

    const fetchStreakData = async () => {
      try {
        const response = await api.get('/streak/me/');

        if (!mounted) return;

        setStreak({
          current: response.data.current_streak,
          lastActivityDate: response.data.last_activity_date,
          loading: false
        });

      } catch (error) {
        console.error('Ошибка загрузки серии:', error);

        if (!mounted) return;

        setStreak(prev => ({ ...prev, loading: false }));
      }
  };

  fetchStreakData();

  return () => {
    mounted = false;
  };
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