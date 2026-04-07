import React from 'react';

const AchievementsBlock = ({ achievements }) => {
    return (
        <div className="profilePage_achievementsBlock">
            <h2 className="profilePage_sectionTitle text">Мои достижения</h2>
            <div className="profilePage_achievements">
                {achievements.length === 0 ? (
                    <div className="profilePage_empty description_text">Нет достижений</div>
                ) : (
                    achievements.map(ach => (
                        <div key={ach.id} className="profilePage_achievement">
                            <div className="profilePage_achievementName text_mini">{ach.name}</div>
                            <div className="profilePage_achievementDesc description_text">{ach.description}</div>
                            <div className="profilePage_achievementDate text_mini">
                                Получено: {new Date(ach.earned_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AchievementsBlock;