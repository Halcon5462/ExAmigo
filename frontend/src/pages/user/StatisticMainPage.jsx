import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../utils/api';
import { getSubjectLabel } from '../../utils/subjectOptions';
import '../../static/css/statistics.css';

const StatisticMainPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get('/statistic/subjects/');
                setSubjects(response.data);
            } catch (err) {
                console.error('Failed to load subjects statistics:', err);
                setError('Не удалось загрузить список предметов.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    if (loading) {
        return <div className="statisticsPage statisticsPage_status">Загрузка...</div>;
    }

    if (error) {
        return <div className="statisticsPage statisticsPage_status">{error}</div>;
    }

    return (
        <div className="statisticsPage">
            <div className="statisticsPage_header smoke">
                <h1 className="statisticsPage_title text">Выбери предмет</h1>
                <p className="statisticsPage_subtitle description_text">
                    Доступны только предметы, по которым у тебя уже есть статистика решений.
                </p>
            </div>

            {!subjects.length ? (
                <div className="statisticsPage_empty description_text">Пока нет данных по предметам.</div>
            ) : (
                <div className="statisticsPage_subjects">
                    {subjects.map((subject) => (
                        <button
                            key={subject}
                            type="button"
                            className="statisticsPage_subjectButton btn_text"
                            onClick={() => navigate(`/statistics/${subject}`)}
                        >
                            {getSubjectLabel(subject)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatisticMainPage;
