import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AchievementsList from '../components/AchievementsList.jsx';
import PurchasedItemList from '../components/PurchasedItemList.jsx';
import UserBalance from '../components/UserBalance.jsx'; // Добавить

const ProfilePage = ({ user: initialUser, onLogout, equipped, refreshEquipped }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectingId, setSelectingId] = useState(null);
    const [selectedFrameId, setSelectedFrameId] = useState(null);
    const [selectedBackgroundId, setSelectedBackgroundId] = useState(null);

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
    const frameImage = toAbsoluteMediaUrl(equipped?.frame?.frame?.icon_frame || equipped?.frame?.icon_frame || null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [
                    api.get('/account/user-achievements/'),
                    api.get('/account/user-progress/'),
                    api.get('/products/products/')
                ];

                if (!initialUser) {
                    requests.push(api.get('/account/profile/'));
                }

                const results = await Promise.all(requests);

                setAchievements(results[0].data);
                setProgress(results[1].data);
                setProducts(results[2].data);

                if (!initialUser && results[3]) {
                    setUser(results[3].data);
                    localStorage.setItem('user', JSON.stringify(results[3].data));
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

    return (
        <div className="profile-container">
            <h1>Профиль пользователя</h1>

            {/*  нужно блок добавить */}
            <div className="avatar-wrapper">
                <img src={avatar} alt="avatar" className="avatar-img" />
                {frameImage && (
                    <img src={frameImage} alt="frame" className="avatar-frame" />
                )}
            </div>

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

            <PurchasedItemList
                products={products}
                selectingId={selectingId}
                selectedFrameId={selectedFrameId}
                selectedBackgroundId={selectedBackgroundId}
                onSelectFrame={handleSelectFrame}
                onSelectBackground={handleSelectBackground}
            />

            <AchievementsList
                achievements={achievements}
                progress={progress}
            />
        </div>
    );
};

export default ProfilePage;
