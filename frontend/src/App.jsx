import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import TaskBank from './pages/TaskBank';
import TaskCreator from './pages/TaskCreator';
import TaskSetCreator from './pages/TaskSetCreator';
import TaskSetList from './pages/TaskSetList';
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
                {user && (
                    <nav className="navbar" style={{ display: 'flex', gap: '15px', padding: '15px', background: '#f5f5f5', marginBottom: '20px' }}>
                        <Link to="/">Главная</Link>
                        <Link to="/tasks">Банк заданий</Link>
                        <Link to="/tasks/create">Создать задание</Link>
                        <Link to="/profile">Профиль</Link>
                        <Link to="/tasksets">Список комплектов</Link>
                    </nav>
                )}

                <Routes>
                    <Route
                        path="/login"
                        element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" replace />}
                    />

                    <Route element={<ProtectedRoute user={user} />}>
                        <Route path="/" element={<HomePage user={user} />} />

                        <Route path="/tasks" element={<TaskBank />} />
                        <Route path="/tasks/create" element={<TaskCreator />} />
                        <Route path="/tasksets/create" element={<TaskSetCreator />} />
                        <Route path="/tasksets" element={<TaskSetList />} />

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