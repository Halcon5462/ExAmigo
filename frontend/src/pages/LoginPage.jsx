import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import "../../static/css/auth.css";

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
                        <h2 className="authPage_title">
                            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
                        </h2>

                        {error && <div className="error-message authPage_error">{error}</div>}

                        <form className="authPage_form" onSubmit={handleSubmit}>
                            <div className="authPage_inputGroup">
                                <input
                                    type="email"
                                    className="input authPage_input"
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
                                        className="input authPage_input"
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
                                    className="input authPage_input"
                                    placeholder="Пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="button button-primary authPage_button"
                                disabled={loading}
                            >
                                {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                            </button>
                        </form>

                        <div className="authPage_footer">
                            <p className="authPage_text">
                                {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                            </p>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="link authPage_link"
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