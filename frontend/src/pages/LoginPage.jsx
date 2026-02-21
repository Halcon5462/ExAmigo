import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // ВХОД
                const response = await api.post('/account/login/', { email, password });
                const { access, refresh, user } = response.data;
                onLogin(user, { access, refresh });
            } else {
                // РЕГИСТРАЦИЯ
                const response = await api.post('/account/register/', { email, name, password });
                const { access, refresh, user } = response.data;
                onLogin(user, { access, refresh });
            }
            navigate('/');
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.password?.[0] ||
                'Произошла ошибка. Проверьте введенные данные.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Имя"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="auth-toggle">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    <button onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;