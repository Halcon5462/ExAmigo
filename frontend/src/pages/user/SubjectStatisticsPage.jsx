import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import StatisticsChart from '../../components/statistics/StatisticsChart';
import TaskStatisticsSection from '../../components/profile/TaskStatisticsSection';
import TasksList from '../../components/statistics/TasksList';
import api from '../../utils/api';
import '../../static/css/statistics.css';

const SubjectStatisticsPage = () => {
    const { subject } = useParams();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await api.get(`/statistic/subjects/${subject}/`);
                setStats(response.data.tasks || []);
            } catch (err) {
                console.error('Failed to load subject statistics:', err);
                setError('Не удалось загрузить статистику по предмету.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [subject]);

    if (loading) {
        return <div className="statisticsPage statisticsPage_status">Загрузка...</div>;
    }

    if (error) {
        return <div className="statisticsPage statisticsPage_status">{error}</div>;
    }

    return (
        <div className="statisticsPage">
            <div className="statisticsPage_header">
                <h1 className="statisticsPage_title text">Статистика: {subject}</h1>
                <p className="statisticsPage_subtitle description_text">
                    График показывает процент верных ответов по каждому номеру задания.
                </p>
            </div>

            <StatisticsChart data={stats} />
            <TaskStatisticsSection stats={stats} />
            <TasksList stats={stats} />
        </div>
    );
};

export default SubjectStatisticsPage;
