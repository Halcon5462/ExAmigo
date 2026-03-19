import { useEffect, useState } from 'react';
import api from '../utils/api';

const MAX_BAR_WIDTH = 200;

const TaskStatisticsSection = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/statistic/tasks/');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to load task statistics:', err);
                setError('Не удалось загрузить статистику заданий');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Загрузка статистики заданий...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!stats.length) {
        return <div>Пока нет данных по решению заданий.</div>;
    }

    const maxAttempts = Math.max(...stats.map((s) => s.attempts_count || 0), 1);

    const getBarWidth = (value) => {
        if (!value) return 0;
        return (value / maxAttempts) * MAX_BAR_WIDTH;
    };

    return (
        <div>
            <h2>Статистика решений заданий</h2>
            {stats.map((item) => (
                <div key={item.id} style={{ marginBottom: '12px' }}>
                    <div>
                        <strong>{item.subject}</strong>, задание №{item.order_KIM}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ minWidth: '80px' }}>Попытки:</div>
                        <div
                            style={{
                                height: '10px',
                                width: `${getBarWidth(item.attempts_count)}px`,
                                backgroundColor: '#90caf9',
                            }}
                        />
                        <span>{item.attempts_count}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ minWidth: '80px' }}>Верные:</div>
                        <div
                            style={{
                                height: '10px',
                                width: `${getBarWidth(item.correct_count)}px`,
                                backgroundColor: '#a5d6a7',
                            }}
                        />
                        <span>{item.correct_count}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ minWidth: '80px' }}>С 1-го раза:</div>
                        <div
                            style={{
                                height: '10px',
                                width: `${getBarWidth(item.correct_first_try)}px`,
                                backgroundColor: '#ffcc80',
                            }}
                        />
                        <span>{item.correct_first_try}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskStatisticsSection;

