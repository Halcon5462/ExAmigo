import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import TaskBank from './pages/TaskBank';
import TaskCreator from './pages/TaskCreator';
import Shop from './pages/Shop';
import TaskSetCreator from './pages/TaskSetCreator';
import TaskSetList from './pages/TaskSetList';
import TaskSetPlayer from './pages/TaskSetPlayer';
import TaskSetAutoGenerator from './pages/TaskSetAutoGenerator';
import ProtectedRoute from './components/ProtectedRoute';
import api from './utils/api';
import Header from './components/Header'
import TestMatchPage from './pages/MatchPage'

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

        // DRF чаще всего отдает /media/...
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
                bg?.background?.image_background
                || bg?.image_background
                || bg?.image;

            applyBackground(toAbsoluteMediaUrl(bgImage) || null);
        } catch (err) {
            // В dev StrictMode эффекты могут вызываться дважды: не спамим консоль.
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
            <div>
                <Header />
                <Routes>
                    <Route
                        path="/login"
                        element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" replace />}
                    />

                    <Route element={<ProtectedRoute user={user} />}>
                        <Route path="/" element={<HomePage user={user} />} />

                        <Route path="/tasks" element={<TaskBank />} />
                        <Route path="/tasks/create" element={<TaskCreator />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/tasksets/create" element={<TaskSetCreator />} />
                        <Route path="/tasksets" element={<TaskSetList />} />
                        <Route path="/tasksets/play/:id" element={<TaskSetPlayer />} />
                        <Route path="/match" element={<TestMatchPage />} />
                        <Route path="/tasksets/auto" element={<TaskSetAutoGenerator />} />
                        <Route
                            path="/profile"
                            element={<ProfilePage user={user} onLogout={handleLogout} equipped={equipped} refreshEquipped={fetchEquipped} />}
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
