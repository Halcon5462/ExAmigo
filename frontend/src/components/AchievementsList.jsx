import React from 'react';

const AchievementsList = ({ achievements = [], progress = [] }) => {
    return (
        <div className="achievements-section">
            <h2>Мои Достижения</h2>

            <div className="achievements-grid">
                {achievements.map((item) => (
                    <div key={item.id} className="achievement-card earned">
                        <img src={item.achievement.icon} alt={item.achievement.name} className="achievement-icon" />
                        <div className="achievement-info">
                            <h3>{item.achievement.name} ✓</h3>
                            <p>{item.achievement.description}</p>
                            <small>Получено: {new Date(item.get_date).toLocaleDateString()}</small>
                            {item.achievement.reward && (
                                <div className="reward-badge">Награда: {item.achievement.reward}</div>
                            )}
                        </div>
                    </div>
                ))}

                {progress.map((item) => {
                    const isEarned = achievements.some(a => a.achievement.id === item.achievement.id);
                    if (isEarned) return null;

                    const percent = Math.min(Math.round((item.current_value / item.achievement.target) * 100), 100);

                    return (
                        <div key={item.id} className="achievement-card locked">
                            <img src={item.achievement.icon} alt={item.achievement.name} className="achievement-icon grayscale" />
                            <div className="achievement-info">
                                <h3>{item.achievement.name}</h3>
                                <p>{item.achievement.description}</p>
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                                <small>{item.current_value} / {item.achievement.target} ({percent}%)</small>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsList;