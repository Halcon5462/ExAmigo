import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import UserInfo from '../../components/profile/UserInfo.jsx';
import AchievementsBlock from '../../components/profile/AchievementsBlock.jsx';
import InventoryBlock from '../../components/profile/InventoryBlock.jsx';
import StatsBlock from '../../components/profile/StatsBlock.jsx';
import UserBalance from '../../components/profile/UserBalance.jsx';
import PurchasedItemList from '../../components/profile/PurchasedItemList.jsx';
import '../../static/css/profile.css';

const ProfilePage = ({ user: initialUser, onLogout, onUserUpdate, equipped, refreshEquipped }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({});
    const [selectingId, setSelectingId] = useState(null);
    const [selectedFrameId, setSelectedFrameId] = useState(null);
    const [selectedBackgroundId, setSelectedBackgroundId] = useState(null);

    const navigate = useNavigate();

    const toAbsoluteMediaUrl = (url) => {
        if (!url || typeof url !== 'string') return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        const origin = window.location.origin;

        if (url.startsWith('/')) {
            return `${origin}${url}`;
        }

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
                    api.get('/statistic/tasks/'),
                ];

                if (!initialUser) {
                    requests.push(api.get('/account/profile/'));
                }

                const results = await Promise.all(requests);

                setAchievements(results[0].data);
                setProducts(results[1].data);
                const taskStats = results[2].data || [];
                const totalTasks = taskStats.reduce(
                    (sum, item) => sum + (item.attempts_count || 0),
                    0
                );
                const correctAnswers = taskStats.reduce(
                    (sum, item) => sum + (item.correct_count || 0),
                    0
                );
                const incorrectAnswers = totalTasks - correctAnswers;
                const averageScore = totalTasks
                    ? Math.round((correctAnswers / totalTasks) * 100)
                    : 0;

                setStats({
                    totalTasks,
                    incorrectAnswers,
                    correctAnswers,
                    averageScore,
                });

                if (!initialUser && results[3]) {
                    setUser(results[3].data);
                    onUserUpdate?.(results[3].data);
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

    if (loading) {
        return <div className="loading">Загрузка профиля...</div>;
    }

    if (!user) {
        return <div className="loading">Пользователь не найден</div>;
    }


return (
    <div className="profilePage">
        <h1 className="profilePage_title text smoke">Профиль пользователя</h1>

        <div className="profilePage_avatarBlock">
            <UserInfo
                user={user}
                frameImage={frameImage}
                onUserUpdate={(nextUser) => {
                    setUser(nextUser);
                    onUserUpdate?.(nextUser);
                }}
                onLogout={onLogout}
            />
        </div>

        <UserBalance />

        <StatsBlock stats={stats} />

        <AchievementsBlock achievements={achievements} toAbsoluteMediaUrl={toAbsoluteMediaUrl} />

        <InventoryBlock
            products={products}
            selectingId={selectingId}
            selectedFrameId={selectedFrameId}
            selectedBackgroundId={selectedBackgroundId}
            onSelectFrame={handleSelectFrame}
            onSelectBackground={handleSelectBackground}
         />

     </div>
 );
};

export default ProfilePage;

