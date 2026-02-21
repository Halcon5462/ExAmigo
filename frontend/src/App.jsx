import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import api from './utils/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Проверяем что токен валидный
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

    const handleLogin = (userData, tokens) => {
        setUser(userData);
        localStorage.setItem('access', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
    };

    if (loading) {
        return <div className="loading">Загрузка приложения...</div>;
    }

    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route
                        path="/login"
                        element={<LoginPage onLogin={handleLogin} />}
                    />

                    <Route element={<ProtectedRoute user={user} />}>
                        <Route path="/" element={<HomePage user={user} />} />
                        <Route
                            path="/profile"
                            element={<ProfilePage user={user} onLogout={handleLogout} />}
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;