import { useState } from 'react';

import '../static/css/header.css';
import '../static/css/style.css';

import Streak from './profile/Streak';

const Header = () => {

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header>

            <div className="logo">
                <img src="/images/logo.svg" alt="Exam Service logo" />
                <h2>ExAmigo</h2>
            </div>

            <nav className="nav">

                <a href="/" className="nav_link">
                    Главная
                </a>

                <div className="dropdown">
                    <button className="dropdown_btn">
                        Обучение
                    </button>

                    <div className="dropdown_content">
                        <a href="/tasks">Банк заданий</a>
                        <a href="/tasksets">Комплекты</a>
                        <a href="/tasksets/auto">Адаптивный вариант</a>
                        <a href="/tasksets/create">Создать комплект</a>
                    </div>
                </div>

                <a href="/match" className="nav_link">
                    Соревнования
                </a>

                <div className="dropdown">
                    <button className="dropdown_btn">
                        Аккаунт
                    </button>

                    <div className="dropdown_content">
                        <a href="/profile">Профиль</a>
                        <a href="/shop">Магазин</a>
                    </div>
                </div>

            </nav>

            <div className="header_right">

                <div className="mobile_menu">

                    <button
                        className="mobile_menu_btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        ☰
                    </button>

                    <div className={`mobile_menu_content ${mobileMenuOpen ? 'active' : ''}`}>
                        <a href="/">Главная</a>
                        <a href="/tasks">Банк заданий</a>
                        <a href="/tasksets">Комплекты</a>
                        <a href="/tasksets/auto">Адаптивный вариант</a>
                        <a href="/tasksets/create">Создать комплект</a>
                        <a href="/match">Соревнования</a>
                        <a href="/profile">Профиль</a>
                        <a href="/shop">Магазин</a>
                    </div>

                </div>

                <Streak />

            </div>

        </header>
    );
};

export default Header;