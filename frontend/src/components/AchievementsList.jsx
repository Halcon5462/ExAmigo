import React from 'react';
import api from '../utils/api';

const toAbsoluteMediaUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const origin = new URL(api.defaults.baseURL).origin;
    if (url.startsWith('/')) {
        return `${origin}${url}`;
    }

    return `${origin}/${url}`;
};

const AchievementsList = ({ achievements = [] }) => {
    return (
        <div className="achievements-section">
            <h2>Мои Достижения</h2>

            <div className="achievements-grid">
                {achievements.map((item) => (
                    <div
                        key={item.id}
                        className={`achievement-card ${item.is_obtained ? 'earned' : 'locked'}`}
                    >
                        <img
                            src={toAbsoluteMediaUrl(item.icon)}
                            alt={item.name}
                            className={`achievement-icon ${item.is_obtained ? '' : 'grayscale'}`}
                            style={{ height: '100px', borderRadius: '5px' }}
                        />
                        <div className="achievement-info">
                            <h3>{item.name}{item.is_obtained ? '  ✓' : ''}</h3>
                            <p>{item.description}</p>
                            {item.reward && (
                                <div className="reward-badge">Награда: {item.reward}</div>
                            )}
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${item.progress_percent}%` }}
                                ></div>
                            </div>
                            <small>{item.current_value} / {item.target} ({item.progress_percent}%)</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsList;
