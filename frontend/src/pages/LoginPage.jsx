import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../../static/css/auth.css';

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
                const response = await api.post('/account/login/', { email, password });
                const { access, refresh, user } = response.data;
                onLogin(user, { access, refresh });
            } else {
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
        <div className="authPage">
            <div className="authPage_container">
                <main className="authPage_main">
                    <div className="authPage_formContainer">
                        <h2 className="authPage_title text">
                            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
                        </h2>

                        {error && <div className="authPage_error description_text">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="authPage_inputGroup">
                                <input
                                    type="email"
                                    className="authPage_input description_text"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div className="authPage_inputGroup">
                                    <input
                                        type="text"
                                        className="authPage_input description_text"
                                        placeholder="Имя"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="authPage_inputGroup">
                                <input
                                    type="password"
                                    className="authPage_input description_text"
                                    placeholder="Пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn_green authPage_button"
                                disabled={loading}
                            >
                                {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                        </form>

                        <div className="authPage_footer">
                            <p className="authPage_text text_mini">
                                {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                            </p>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="authPage_link btn_text"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {isLogin ? 'Зарегистрироваться' : 'Войти'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LoginPage;