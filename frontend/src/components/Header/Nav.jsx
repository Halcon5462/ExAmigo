import React from 'react';

const Nav = () => {
    return (
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
    );
};

export default Nav;