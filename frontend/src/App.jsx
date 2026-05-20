import { BrowserRouter } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';

import Header from './components/Header/Header';
import api from './utils/api';

import AppRoutes from './routes.jsx';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [equipped, setEquipped] = useState(null);

    const equippedReqInFlight = useRef(false);
    const lastEquippedErrorAt = useRef(0);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const response = await api.get('/account/profile/');
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (err) {
                    console.error('Auth check failed:', err);
                    localStorage.clear();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const applyBackground = (imageUrl) => {
        if (!imageUrl) {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.backgroundPosition = '';
            return;
        }

        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
    };

    const toAbsoluteMediaUrl = (url) => {
        if (!url) return null;
        if (typeof url !== 'string') return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        const origin = new URL(api.defaults.baseURL).origin;
        if (url.startsWith('/')) return `${origin}${url}`;
        return `${origin}/${url}`;
    };

    const fetchEquipped = useCallback(async () => {
        if (!user) {
            setEquipped(null);
            applyBackground(null);
            return;
        }

        try {
            if (equippedReqInFlight.current) return;
            equippedReqInFlight.current = true;

            const response = await api.get('/products/equipped/');
            setEquipped(response.data);

            const bg = response.data?.background;
            const bgImage =
                bg?.background?.image_background ||
                bg?.image_background ||
                bg?.image;

            applyBackground(toAbsoluteMediaUrl(bgImage) || null);
        } catch (err) {
            const now = Date.now();
            if (now - lastEquippedErrorAt.current > 3000) {
                console.error('Failed to fetch equipped:', err);
                lastEquippedErrorAt.current = now;
            }
        } finally {
            equippedReqInFlight.current = false;
        }
    }, [user]);

    useEffect(() => {
        fetchEquipped();
    }, [fetchEquipped]);

    const handleLogin = (userData, tokens) => {
        setUser(userData);
        localStorage.setItem('access', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleUserUpdate = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
        setEquipped(null);
        applyBackground(null);
    };

    if (loading) {
        return <div className="loading">Загрузка приложения...</div>;
    }

    return (
        <BrowserRouter>
            <Header />

            <AppRoutes
                user={user}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                handleUserUpdate={handleUserUpdate}
                equipped={equipped}
                fetchEquipped={fetchEquipped}
            />
        </BrowserRouter>
    );
}

export default App;