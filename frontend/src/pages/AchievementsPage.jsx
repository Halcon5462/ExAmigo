import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AchievementsList from '../components/AchievementsList.jsx';
import api from '../utils/api';

const AchievementsPage = ({ onLogout }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const response = await api.get('/achievements/');
                setAchievements(response.data);
            } catch (err) {
                console.error('Failed to fetch achievements:', err);
                if (err.response?.status === 401) {
                    onLogout?.();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [navigate, onLogout]);

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="profile-container">
            <h1>Ваши достижения:</h1>
            <AchievementsList achievements={achievements} />
        </div>
    );
};

export default AchievementsPage;
