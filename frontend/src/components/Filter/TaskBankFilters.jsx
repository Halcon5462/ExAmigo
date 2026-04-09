import React from 'react';

const TaskBankFilters = ({ options, filters, onFilterChange }) => {
    const { subjects = [], orders = [], types = [], difficulties = [], authors = [] } = options;

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="filters-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <select name="subject" value={filters.subject || ''} onChange={handleChange} className="form-select">
                <option value="">Все предметы</option>
                {subjects.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

            <select name="orderKIM" value={filters.orderKIM || ''} onChange={handleChange} className="form-select">
                <option value="">Все номера</option>
                {orders.map(order => (
                    <option key={order} value={String(order)}>{order}</option>
                ))}
            </select>

            <select name="type" value={filters.type || ''} onChange={handleChange} className="form-select">
                <option value="">Все разделы</option>
                {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>

            <select name="difficulty" value={filters.difficulty || ''} onChange={handleChange} className="form-select">
                <option value="">Любая сложность</option>
                {difficulties.map(level => (
                    <option key={level} value={String(level)}>{level}</option>
                ))}
            </select>

            <select name="author" value={filters.author || ''} onChange={handleChange} className="form-select">
                <option value="">Любой источник</option>
                {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                ))}
            </select>
        </div>
    );
};

export default TaskBankFilters;