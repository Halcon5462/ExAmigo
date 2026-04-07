import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AchievementsList from '../components/AchievementsList.jsx';
import AvatarPicker from '../components/AvatarPicker.jsx';
import PurchasedItemList from '../components/PurchasedItemList.jsx';
import UserBalance from '../components/UserBalance.jsx';
import TaskStatisticsSection from '../components/TaskStatisticsSection.jsx';
import '../static/css/profile.css';

const ProfilePage = ({ user: initialUser, onLogout, onUserUpdate, equipped, refreshEquipped }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectingId, setSelectingId] = useState(null);
    const [selectedFrameId, setSelectedFrameId] = useState(null);
    const [selectedBackgroundId, setSelectedBackgroundId] = useState(null);

    const navigate = useNavigate();

    const toAbsoluteMediaUrl = (url) => {
        if (!url) return null;
        if (typeof url !== 'string') return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const origin = new URL(api.defaults.baseURL).origin;
        if (url.startsWith('/')) return `${origin}${url}`;
        return `${origin}/${url}`;
    };

    const frameImage = toAbsoluteMediaUrl(
        equipped?.frame?.frame?.icon_frame || equipped?.frame?.icon_frame || null
    );

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [
                    api.get('/achievements/'),
                    api.get('/products/products/')
                ];

                if (!initialUser) {
                    requests.push(api.get('/account/profile/'));
                }

                const results = await Promise.all(requests);

                setAchievements(results[0].data);
                setProducts(results[1].data);

                if (!initialUser && results[2]) {
                    setUser(results[2].data);
                    onUserUpdate?.(results[2].data);
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
    }, [initialUser, navigate, onLogout, onUserUpdate]);

    useEffect(() => {
        const nextFrameId = equipped?.frame?.id ?? null;
        const nextBackgroundId = equipped?.background?.id ?? null;
        setSelectedFrameId(nextFrameId);
        setSelectedBackgroundId(nextBackgroundId);
    }, [equipped]);

    const handleSelectFrame = async (product) => {
        if (!product?.user_product_id) return;
        setSelectingId(product.id);

        try {
            await api.post('/products/equip/', { user_product_id: product.user_product_id });
            await refreshEquipped?.();
        } finally {
            setSelectingId(null);
        }
    };

    const handleSelectBackground = async (product) => {
        if (!product?.user_product_id) return;
        setSelectingId(product.id);

        try {
            await api.post('/products/equip/', { user_product_id: product.user_product_id });
            await refreshEquipped?.();
        } finally {
            setSelectingId(null);
        }
    };

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

    // ========== ПОСЛЕ RETURN МОЖНО МЕНЯТЬ ==========

return (
    <div className="profilePage">
        <h1 className="profilePage_title text">Профиль пользователя</h1>

        {/* Блок аватарки */}
        <div className="profilePage_avatarBlock">
            <AvatarPicker
                user={user}
                frameImage={frameImage}
                onUserUpdate={(nextUser) => {
                    setUser(nextUser);
                    onUserUpdate?.(nextUser);
                }}
            />
        </div>

        <UserBalance />

        {/* Карточка профиля */}
        <div className="profilePage_card">
            <div className="profilePage_field">
                <label className="profilePage_label description_text">Email:</label>
                <span className="profilePage_value description_text">{user.email}</span>
            </div>
            <div className="profilePage_field">
                <label className="profilePage_label description_text">Имя:</label>
                <span className="profilePage_value description_text">{user.name}</span>
            </div>
            <div className="profilePage_field">
                <label className="profilePage_label description_text">ID:</label>
                <span className="profilePage_value description_text">{user.id}</span>
            </div>
            <button className="profilePage_logoutBtn btn_text" onClick={handleLogout}>
                Выйти из аккаунта
            </button>
        </div>

        {/* Блок достижений */}
        <div className="profilePage_achievementsBlock">
            <h2 className="profilePage_sectionTitle text">Мои достижения</h2>
            <div className="profilePage_achievements">
                {achievements.length === 0 ? (
                    <div className="profilePage_empty description_text">Нет достижений</div>
                ) : (
                    achievements.map(ach => (
                        <div key={ach.id} className="profilePage_achievement">
                            <div className="profilePage_achievementName text_mini">{ach.name}</div>
                            <div className="profilePage_achievementDesc description_text">{ach.description}</div>
                            <div className="profilePage_achievementDate text_mini">
                                Получено: {new Date(ach.earned_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Блок инвентаря */}
        <div className="profilePage_inventoryBlock">
            <h2 className="profilePage_sectionTitle text">Мой инвентарь</h2>

            <div className="profilePage_filters">
                <div className="profilePage_filter">
                    <span className="profilePage_filterLabel description_text">Статус:</span>
                    <select className="profilePage_filterSelect description_text">
                        <option value="all">Все</option>
                        <option value="active">Активные</option>
                        <option value="inactive">Неактивные</option>
                    </select>
                </div>
                <div className="profilePage_filter">
                    <span className="profilePage_filterLabel description_text">Автор:</span>
                    <select className="profilePage_filterSelect description_text">
                        <option value="all">Все</option>
                    </select>
                </div>
                <div className="profilePage_filter">
                    <span className="profilePage_filterLabel description_text">Поиск:</span>
                    <input type="text" placeholder="Название предмета" className="profilePage_filterInput description_text" />
                </div>
            </div>

            <div className="profilePage_inventory">
                <div className="profilePage_empty description_text">Нет предметов в инвентаре</div>
            </div>
        </div>

        {/* Блок статистики */}
        <div className="profilePage_statsBlock">
            <h2 className="profilePage_sectionTitle text">Статистика</h2>
            <div className="profilePage_statsGrid">
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">0</div>
                    <div className="profilePage_statLabel description_text">Всего заданий</div>
                </div>
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">0</div>
                    <div className="profilePage_statLabel description_text">Выполнено</div>
                </div>
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">0</div>
                    <div className="profilePage_statLabel description_text">Верных ответов</div>
                </div>
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">0%</div>
                    <div className="profilePage_statLabel description_text">Средний балл</div>
                </div>
            </div>
            <div className="profilePage_statsButton">
                <button className="profilePage_detailStatsBtn btn_text" onClick={() => navigate('/statistics')}>
                    Подробная статистика →
                </button>
            </div>
        </div>

        <PurchasedItemList
            products={products}
            selectingId={selectingId}
            selectedFrameId={selectedFrameId}
            selectedBackgroundId={selectedBackgroundId}
            onSelectFrame={handleSelectFrame}
            onSelectBackground={handleSelectBackground}
        />

        <TaskStatisticsSection />
    </div>
);
};

export default ProfilePage;