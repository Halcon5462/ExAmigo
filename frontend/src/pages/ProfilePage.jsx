import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AchievementsList from '../components/AchievementsList.jsx';
import UserBalance from '../components/UserBalance.jsx'; // Добавить

const ProfilePage = ({ user: initialUser, onLogout }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [
                    api.get('/account/user-achievements/'),
                    api.get('/account/user-progress/')
                ];

                if (!initialUser) {
                    requests.push(api.get('/account/profile/'));
                }

                const results = await Promise.all(requests);

                setAchievements(results[0].data);
                setProgress(results[1].data);

                if (!initialUser && results[2]) {
                    setUser(results[2].data);
                    localStorage.setItem('user', JSON.stringify(results[2].data));
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                if (err.response?.status === 401) {
                    onLogout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialUser, onLogout, navigate]);

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Загрузка профиля...</div>;
    }

    if (!user) {
        return <div className="loading">Пользователь не найден</div>;
    }

    return (
        <div className="profile-container">
            <h1>Профиль пользователя</h1>

            {/*  нужно блок добавить */}
            <UserBalance />

            <div className="profile-card">
                <div className="profile-field">
                    <label>Email:</label>
                    <span>{user.email}</span>
                </div>

                <div className="profile-field">
                    <label>Имя:</label>
                    <span>{user.name}</span>
                </div>

                <div className="profile-field">
                    <label>ID:</label>
                    <span>{user.id}</span>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    Выйти из аккаунта
                </button>
            </div>

            <AchievementsList
                achievements={achievements}
                progress={progress}
            />
        </div>
    );
};

export default ProfilePage;