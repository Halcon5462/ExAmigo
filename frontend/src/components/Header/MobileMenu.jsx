import React from 'react';

const MobileMenu = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    return (
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
    );
};

export default MobileMenu;