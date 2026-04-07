import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatsBlock = ({ stats }) => {
    const navigate = useNavigate();

    return (
        <div className="profilePage_statsBlock">
            <h2 className="profilePage_sectionTitle text">Статистика</h2>
            <div className="profilePage_statsGrid">
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">{stats.totalTasks || 0}</div>
                    <div className="profilePage_statLabel description_text">Всего заданий</div>
                </div>
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">{stats.completedTasks || 0}</div>
                    <div className="profilePage_statLabel description_text">Выполнено</div>
                </div>
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">{stats.correctAnswers || 0}</div>
                    <div className="profilePage_statLabel description_text">Верных ответов</div>
                </div>
                <div className="profilePage_statCard">
                    <div className="profilePage_statValue">{stats.averageScore || 0}%</div>
                    <div className="profilePage_statLabel description_text">Средний балл</div>
                </div>
            </div>
            <div className="profilePage_statsButton">
                <button className="profilePage_detailStatsBtn btn_text" onClick={() => navigate('/statistics')}>
                    Подробная статистика →
                </button>
            </div>
        </div>
    );
};

export default StatsBlock;