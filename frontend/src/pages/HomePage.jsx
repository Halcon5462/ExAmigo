const HomePage = ({ user }) => {
    return (
        <div className="home-container">
            <h1>Добро пожаловать!</h1>
            {user && (
                <div className="welcome-message">
                    <p>Вы вошли как: <strong>{user.email}</strong></p>
                </div>
            )}
        </div>
    );
};

export default HomePage;