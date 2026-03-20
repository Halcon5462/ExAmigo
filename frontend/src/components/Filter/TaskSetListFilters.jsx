import React from 'react';

const TaskSetListFilters = ({ taskSets, filters, onFilterChange }) => {
    const testTypes = [...new Set(taskSets.map(ts => ts.subject).filter(Boolean))];
    const difficulties = [...new Set(taskSets.map(ts => ts.average_difficulty).filter(Boolean))].sort((a, b) => a - b);
    const authors = [...new Set(taskSets.map(ts => ts.author_name || ts.author_email || ts.author).filter(Boolean))];

    const taskCounts = [...new Set(taskSets.map(ts => ts.items?.length || 0).filter(t => t > 0))].sort((a, b) => a - b);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="taskset-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
            <select name="testType" value={filters.testType || ''} onChange={handleChange} className="form-select">
                <option value="">Тип теста</option>
                {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>

            <select name="difficulty" value={filters.difficulty || ''} onChange={handleChange} className="form-select">
                <option value="">Сложность</option>
                {difficulties.map(level => (
                    <option key={level} value={String(level)}>
                        {level === 1 ? 'Легкая' : level === 2 ? 'Средняя' : level === 3 ? 'Высокая' : `Уровень ${level}`}
                    </option>
                ))}
            </select>

            <select name="taskCount" value={filters.taskCount || ''} onChange={handleChange} className="form-select">
                <option value="">Кол-во заданий</option>
                {taskCounts.map(count => (
                    <option key={count} value={String(count)}>{count}</option>
                ))}
            </select>

            <select name="author" value={filters.author || ''} onChange={handleChange} className="form-select">
                <option value="">Автор</option>
                {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                ))}
            </select>

            <select name="kimTasks" value={filters.kimTasks || ''} onChange={handleChange} className="form-select">
                <option value="">Задания из КИМ</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
            </select>

            <input
                type="text"
                name="searchQuery"
                placeholder="Поиск..."
                value={filters.searchQuery || ''}
                onChange={handleChange}
                className="form-control"
                style={{ width: '200px' }}
            />
        </div>
    );
};

export default TaskSetListFilters;