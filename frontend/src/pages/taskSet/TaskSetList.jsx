import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../static/css/taskset.css';

const TaskSetList = () => {
    const [tasksets, setTasksets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        testType: '',
        difficulty: '',
        taskCount: '',
        author: '',
        kimTasks: '',
        searchQuery: '',
    });
    const navigate = useNavigate();

    const startExam = async (setId) => {
        try {
        const resp = await api.post(`/taskBank/tasksets/${setId}/start-exam/`);
        const examId = resp.data?.exam_id;
        navigate(`/tasksets/play/${setId}?exam=${examId}`);
        } catch (e) {
        console.error(e);
        alert('Не удалось начать экзамен');
        }
    };


    useEffect(() => {
        const fetchTaskSets = async () => {
            try {
                const resp = await api.get('/taskBank/tasksets/');
                setTasksets(resp.data);
            } catch (e) {
                console.error(e);
                setError('Не удалось загрузить комплекты заданий');
            } finally {
                setLoading(false);
            }
        };
        fetchTaskSets();
    }, []);

    const testTypes = [...new Set(tasksets.map(ts => ts.subject).filter(Boolean))];
    const authors = [...new Set(tasksets.map(ts => ts.author_name || ts.author_email || ts.author).filter(Boolean))];
    const difficulties = [...new Set(tasksets.map(ts => Math.round(ts.average_difficulty)).filter(d => d > 0))].sort((a, b) => a - b);
    const taskCounts = [...new Set(tasksets.map(ts => ts.items?.length || 0).filter(c => c > 0))].sort((a, b) => a - b);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredTaskSets = tasksets.filter(ts => {
        if (filters.testType && ts.subject !== filters.testType) return false;
        if (filters.difficulty && Math.round(ts.average_difficulty) !== Number(filters.difficulty)) return false;
        if (filters.taskCount && String(ts.items?.length || 0) !== filters.taskCount) return false;
        if (filters.author) {
            const authorValue = ts.author_name || ts.author_email || String(ts.author || '');
            if (authorValue !== filters.author) return false;
        }
        if (filters.kimTasks === 'true' && !ts.kim_tasks) return false;
        if (filters.kimTasks === 'false' && ts.kim_tasks) return false;
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (!ts.name.toLowerCase().includes(query)) return false;
        }
        if (!ts.is_public) return false;
        return true;
    });

    const getDifficultyName = (level) => {
        if (level === 1) return 'Легкая';
        if (level === 2) return 'Средняя';
        if (level === 3) return 'Высокая';
        return `Уровень ${level}`;
    };

    if (loading) return <div className="text_mini">Загрузка комплектов...</div>;
    if (error) return <div className="text_mini">{error}</div>;

    return (
        <div className="taskset-list">
            <h1 className="taskset-list_title text smoke">Список комплектов заданий</h1>

            <div className="taskset-filters">
                <select name="testType" value={filters.testType} onChange={handleFilterChange}>
                    <option value="">Предмет</option>
                    {testTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
                    <option value="">Сложность</option>
                    {difficulties.map(level => (
                        <option key={level} value={level}>{getDifficultyName(level)}</option>
                    ))}
                </select>

                <select name="taskCount" value={filters.taskCount} onChange={handleFilterChange}>
                    <option value="">Кол-во заданий</option>
                    {taskCounts.map(count => (
                        <option key={count} value={count}>{count}</option>
                    ))}
                </select>

                <select name="author" value={filters.author} onChange={handleFilterChange}>
                    <option value="">Автор</option>
                    {authors.map(author => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>

                <select name="kimTasks" value={filters.kimTasks} onChange={handleFilterChange}>
                    <option value="">Задания из КИМ</option>
                    <option value="true">Да</option>
                    <option value="false">Нет</option>
                </select>

                <input
                    type="text"
                    name="searchQuery"
                    placeholder="Поиск..."
                    value={filters.searchQuery}
                    onChange={handleFilterChange}
                    className="taskset-filters_search"
                />
            </div>

            {filteredTaskSets.length === 0 ? (
                <p className="text_mini">Нет доступных комплектов.</p>
            ) : (
                filteredTaskSets.map(set => (
                    <div key={set.id} className="taskset-card">
                        <h3 className="taskset-card_title">{set.name}</h3>
                        <p><strong>Тип:</strong> {set.type}</p>
                        <div className="taskset-card_info">
                            <div className="taskset-card_info-item">
                                <span className="taskset-card_info-label">Автор:</span>
                                <span>{set.author_name || set.author_email || 'Аноним'}</span>
                            </div>
                            <div className="taskset-card_info-item">
                                <span className="taskset-card_info-label">Заданий:</span>
                                <span>{set.items?.length || 0}</span>
                            </div>
                            <div className="taskset-card_info-item">
                                <span className="taskset-card_info-label">Сложность:</span>
                                <span>{getDifficultyName(Math.round(set.average_difficulty))}</span>
                            </div>
                            <div className="taskset-card_info-item">
                                <span className="taskset-card_info-label">Предмет:</span>
                                <span>{set.subject_display || set.subject}</span>
                            </div>
                        </div>
                        {set.kim_tasks && (
                            <div className="taskset-card_kim description_text">
                                Задания из КИМ: {set.kim_tasks}
                            </div>
                        )}
                        {set.type === 'exam' ? (
                            <button className="taskset-card_button btn_text" onClick={() => startExam(set.id)}>
                            Начать экзамен
                            </button>
                        ) : (
                            <button 
                            className="taskset-card_button btn_text" 
                            onClick={() => navigate(`/tasksets/play/${set.id}`)}>
                            Начать
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default TaskSetList;
