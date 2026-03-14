import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AchievementsList from '../components/AchievementsList.jsx';
import PurchasedItemList from '../components/PurchasedItemList.jsx';
import UserBalance from '../components/UserBalance.jsx'; // Добавить

const ProfilePage = ({ user: initialUser, onLogout }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectingId, setSelectingId] = useState(null);
    const [selectedFrameId, setSelectedFrameId] = useState(() => {
        const v = localStorage.getItem('selected_frame_id');
        return v ? Number(v) : null;
    });
    const [selectedBackgroundId, setSelectedBackgroundId] = useState(() => {
        const v = localStorage.getItem('selected_background_id');
        return v ? Number(v) : null;
    });

    const navigate = useNavigate();

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
        if (!selectedBackgroundId) return;
        const product = (products || []).find(p => p?.id === selectedBackgroundId);
        const image = product?.background?.image_background || product?.image_background || product?.image;
        if (!image) return;

        document.body.style.backgroundImage = `url(${image})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
    }, [selectedBackgroundId, products]);

    const handleSelectFrame = (product) => {
        if (!product?.id) return;
        setSelectingId(product.id);
        setSelectedFrameId(product.id);
        localStorage.setItem('selected_frame_id', String(product.id));
        setSelectingId(null);
    };

    const handleSelectBackground = (product) => {
        if (!product?.id) return;
        setSelectingId(product.id);
        setSelectedBackgroundId(product.id);
        localStorage.setItem('selected_background_id', String(product.id));
        setSelectingId(null);
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
