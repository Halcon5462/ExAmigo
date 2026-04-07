import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AchievementsList from '../components/AchievementsList.jsx';
import PurchasedItemList from '../components/PurchasedItemList.jsx';
import UserBalance from '../components/UserBalance.jsx';
import TaskStatisticsSection from '../components/TaskStatisticsSection.jsx';
import UserInfo from '../components/UserInfo.jsx';
import AchievementsBlock from '../components/AchievementsBlock.jsx';
import InventoryBlock from '../components/InventoryBlock.jsx';
import StatsBlock from '../components/StatsBlock.jsx';
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
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        correctAnswers: 0,
        averageScore: 0
    });

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

    if (loading) {
        return <div className="text_mini">Загрузка профиля...</div>;
    }

    if (!user) {
        return <div className="text_mini">Пользователь не найден</div>;
    }

    return (
        <div className="profilePage">
            <h1 className="profilePage_title text">Профиль пользователя</h1>

            <UserInfo
                user={user}
                onLogout={handleLogout}
                frameImage={frameImage}
                onUserUpdate={(nextUser) => {
                    setUser(nextUser);
                    onUserUpdate?.(nextUser);
                }}
            />

            <AchievementsBlock achievements={achievements} />

            <InventoryBlock
                inventory={allInventory}
                onUseItem={handleUseItem}
                onRemoveItem={handleRemoveItem}
            />

            <StatsBlock stats={stats} />

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