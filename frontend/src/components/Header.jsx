import '../static/css/header.css';
import '../static/css/style.css';

const Header = () => {
    return (
        <header>
            <div className="logo">
                <img src="/images/logo.svg" alt="Exam Service logo" />
                <h2>Exam Service</h2>
            </div>
            <nav>
                <a href="/">Главная</a>
                <a href="/tasks">Банк заданий</a>
                <a href="/tasks/create">Создать задание</a>
                <a href="/shop">Магазин</a>
                <a href="/profile">Профиль</a>
                <a href="/tasksets">Список комплектов</a>
                <a href="/tasksets/create">Создать комплект</a>
                <a href="/tasksets/auto">Адаптивный вариант</a>
                <a href="/match">Соревнования</a>
            </nav>
        </header>
    );
};

export default Header;