import React from 'react';

const TaskBankFilters = ({ tasks, filters, onFilterChange }) => {
    const subjects = [...new Map(
        tasks
            .filter(t => t.subject)
            .map(t => [t.subject, t.subject_display || t.subject])
    ).entries()].map(([value, label]) => ({ value, label }));
    const orders = [...new Set(tasks.map(t => t.order_KIM).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const types = [...new Set(tasks.map(t => t.type).filter(Boolean))];
    const difficulties = [...new Set(tasks.map(t => t.difficulty).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const authors = [...new Set(tasks.map(t => t.author_name || t.author_email || t.author).filter(Boolean))];

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="filters-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <select name="subject" value={filters.subject || ''} onChange={handleChange} className="form-select">
                <option value="">Все предметы</option>
                {subjects.map(subject => (
                    <option key={subject.value} value={subject.value}>{subject.label}</option>
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
