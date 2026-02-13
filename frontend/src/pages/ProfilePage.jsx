import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ProfilePage = ({ user: initialUser, onLogout }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile/');
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
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

        if (!initialUser) {
            fetchProfile();
        } else {
            setLoading(false);
        }
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
        </div>
    );
};

export default ProfilePage;