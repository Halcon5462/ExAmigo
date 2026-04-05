import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AchievementsList from '../components/AchievementsList.jsx';
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
    const [inventory, setInventory] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAuthor, setFilterAuthor] = useState('all');
    const [searchName, setSearchName] = useState('');
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        correctAnswers: 0,
        averageScore: 0
    });

    const navigate = useNavigate();

    const avatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="100%25" height="100%25" fill="%23FFD54F"/><circle cx="88" cy="108" r="18" fill="%23000"/><circle cx="168" cy="108" r="18" fill="%23000"/><path d="M70 170 Q128 220 186 170" stroke="%23000" stroke-width="12" fill="none" stroke-linecap="round"/></svg>';

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

    const handleAvatarUpload = () => {
        alert('Загрузка аватарки будет здесь');
    };

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [
                    api.get('/achievements/'),
                    api.get('/products/products/'),
                    api.get('/account/inventory/'),
                    api.get('/account/statistics/')
                ];

                if (!initialUser) {
                    requests.push(api.get('/account/profile/'));
                }

                const results = await Promise.all(requests);

                setAchievements(results[0].data);
                setProducts(results[1].data);
                setInventory(results[2].data);
                setStats(results[3].data);

                if (!initialUser && results[4]) {
                    setUser(results[4].data);
                    onUserUpdate?.(results[4].data);
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

    const handleUseItem = async (itemId) => {
        try {
            await api.post(`/account/inventory/${itemId}/use/`);
            const invRes = await api.get('/account/inventory/');
            setInventory(invRes.data);
            alert('Предмет использован');
        } catch (err) {
            console.error(err);
            alert('Ошибка использования');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await api.post(`/account/inventory/${itemId}/remove/`);
            const invRes = await api.get('/account/inventory/');
            setInventory(invRes.data);
            alert('Предмет снят');
        } catch (err) {
            console.error(err);
            alert('Ошибка снятия');
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const goToStatistics = () => {
        navigate('/statistics');
    };

    // Добавляем frame в инвентарь, если он есть
    const allInventory = [...inventory];
    if (frameImage && !allInventory.find(item => item.name === 'Рамка')) {
        allInventory.push({
            id: 'frame',
            name: 'Рамка аватара',
            author: 'Система',
            quantity: 1,
            status: 'active',
            isFrame: true
        });
    }

    const authors = [...new Set(allInventory.map(item => item.author).filter(Boolean))];

    const filteredInventory = allInventory.filter(item => {
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (filterAuthor !== 'all' && item.author !== filterAuthor) return false;
        if (searchName && !item.name.toLowerCase().includes(searchName.toLowerCase())) return false;
        return true;
    });

    if (loading) {
        return <div className="text_mini">Загрузка профиля...</div>;
    }

    if (!user) {
        return <div className="text_mini">Пользователь не найден</div>;
    }

    return (
        <div className="profilePage">
            <h1 className="profilePage_title text">Профиль пользователя</h1>

            {/* БЛОК 1: Информация о пользователе */}
            <div className="profilePage_userBlock">
                <div className="profilePage_avatar">
                    <img src={avatar} alt="avatar" className="profilePage_avatar-img" />
                    {frameImage && (
                        <img src={frameImage} alt="frame" className="profilePage_avatar-frame" />
                    )}
                    <button
                        className="profilePage_avatar-upload"
                        onClick={handleAvatarUpload}
                        title="Загрузить аватарку"
                    >
                        📷
                    </button>
                </div>
                <div className="profilePage_userInfo">
                    <h2 className="profilePage_name text">{user.name || user.username}</h2>
                    <p className="profilePage_email description_text">{user.email}</p>
                    <p className="profilePage_id description_text">ID: {user.id}</p>
                    <p className="profilePage_coins text_mini">Мои Умконы: {user.coins || 0}</p>
                    <button className="profilePage_logout-btn btn_text" onClick={handleLogout}>
                        Выйти из аккаунта
                    </button>
                </div>
            </div>

            {/* БЛОК 2: Мои достижения */}
            <div className="profilePage_achievementsBlock">
                <h2 className="profilePage_section-title text">Мои достижения</h2>
                <div className="profilePage_achievements">
                    {achievements.length === 0 ? (
                        <div className="profilePage_empty description_text">Нет достижений</div>
                    ) : (
                        achievements.map(ach => (
                            <div key={ach.id} className="profilePage_achievement">
                                <div className="profilePage_achievement-name text_mini">{ach.name}</div>
                                <div className="profilePage_achievement-desc description_text">{ach.description}</div>
                                <div className="profilePage_achievement-date text_mini">
                                    Получено: {new Date(ach.earned_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* БЛОК 3: Мой инвентарь */}
            <div className="profilePage_inventoryBlock">
                <h2 className="profilePage_section-title text">Мой инвентарь</h2>

                <div className="profilePage_filters">
                    <div className="profilePage_filter">
                        <span className="profilePage_filter-label description_text">Статус:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="profilePage_filter-select description_text"
                        >
                            <option value="all">Все</option>
                            <option value="active">Активные</option>
                            <option value="inactive">Неактивные</option>
                        </select>
                    </div>

                    <div className="profilePage_filter">
                        <span className="profilePage_filter-label description_text">Автор:</span>
                        <select
                            value={filterAuthor}
                            onChange={(e) => setFilterAuthor(e.target.value)}
                            className="profilePage_filter-select description_text"
                        >
                            <option value="all">Все</option>
                            {authors.map(author => (
                                <option key={author} value={author}>{author}</option>
                            ))}
                        </select>
                    </div>

                    <div className="profilePage_filter">
                        <span className="profilePage_filter-label description_text">Поиск:</span>
                        <input
                            type="text"
                            placeholder="Название предмета"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="profilePage_filter-input description_text"
                        />
                    </div>
                </div>

                <div className="profilePage_inventory">
                    {filteredInventory.length === 0 ? (
                        <div className="profilePage_empty description_text">Нет предметов в инвентаре</div>
                    ) : (
                        filteredInventory.map(item => (
                            <div key={item.id} className="profilePage_item">
                                <div className="profilePage_item-name text">{item.name}</div>
                                <div className="profilePage_item-author description_text">Автор: {item.author || 'Система'}</div>
                                <div className="profilePage_item-count text_mini">Количество: {item.quantity || 1}</div>
                                {item.status === 'active' ? (
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="profilePage_item-button remove btn_text"
                                    >
                                        Снять
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUseItem(item.id)}
                                        className="profilePage_item-button btn_text"
                                    >
                                        Использовать
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* БЛОК 4: Краткая статистика + кнопка перехода */}
            <div className="profilePage_statsBlock">
                <h2 className="profilePage_section-title text">Статистика</h2>
                <div className="profilePage_statsGrid">
                    <div className="profilePage_statCard">
                        <div className="profilePage_statValue">{stats.totalTasks || 0}</div>
                        <div className="profilePage_statLabel description_text">Всего заданий</div>
                    </div>
                    <div className="profilePage_statCard">
                        <div className="profilePage_statValue">{stats.completedTasks || 0}</div>
                        <div className="profilePage_statLabel description_text">Выполнено</div>
                    </div>
                    <div className="profilePage_statCard">
                        <div className="profilePage_statValue">{stats.correctAnswers || 0}</div>
                        <div className="profilePage_statLabel description_text">Верных ответов</div>
                    </div>
                    <div className="profilePage_statCard">
                        <div className="profilePage_statValue">{stats.averageScore || 0}%</div>
                        <div className="profilePage_statLabel description_text">Средний балл</div>
                    </div>
                </div>
                <div className="profilePage_statsButton">
                    <button className="profilePage_detailStatsBtn btn_text" onClick={goToStatistics}>
                        Подробная статистика →
                    </button>
                </div>
            </div>

            {/* Купленные предметы */}
            <PurchasedItemList
                products={products}
                selectingId={selectingId}
                selectedFrameId={selectedFrameId}
                selectedBackgroundId={selectedBackgroundId}
                onSelectFrame={handleSelectFrame}
                onSelectBackground={handleSelectBackground}
            />

            {/* Статистика по задачам */}
            <TaskStatisticsSection />
        </div>
    );
};

export default ProfilePage;