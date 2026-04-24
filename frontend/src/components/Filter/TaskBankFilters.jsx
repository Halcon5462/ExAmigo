import React from 'react';

const TaskBankFilters = ({ options, filters, onFilterChange }) => {
    const { subjects = [], orders = [], types = [], difficulties = [], authors = [] } = options;

    const uniqueBy = (items, keyFn) => {
        const seen = new Set();
        const out = [];
        for (const item of items) {
            const key = keyFn(item);
            if (key === null || key === undefined) continue;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(item);
        }
        return out;
    };

    const normalizedOrders = uniqueBy(
        (orders || []).map(o => {
            const n = Number(o);
            return Number.isFinite(n) ? String(Math.round(n)) : String(o);
        }),
        v => v
    );

    const normalizedTypes = uniqueBy(
        (types || []).map(t => (typeof t === 'string' ? t.trim() : t)).filter(Boolean),
        v => v
    );

    const normalizedDifficulties = uniqueBy(
        (difficulties || []).map(d => {
            const n = Number(d);
            return Number.isFinite(n) ? String(Math.round(n)) : String(d);
        }),
        v => v
    ).sort((a, b) => Number(a) - Number(b));

    const normalizedAuthors = uniqueBy(
        (authors || []).map(a => (typeof a === 'string' ? a.trim() : a)).filter(Boolean),
        v => v
    );

    const normalizedSubjects = uniqueBy(
        (subjects || []).filter(s => s && s.value !== undefined && s.value !== null),
        s => String(s.value)
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="filters-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <select name="subject" value={filters.subject || ''} onChange={handleChange} className="form-select">
                <option value="">Все предметы</option>
                {normalizedSubjects.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

            <select name="orderKIM" value={filters.orderKIM || ''} onChange={handleChange} className="form-select">
                <option value="">Все номера</option>
                {normalizedOrders.map(order => (
                    <option key={order} value={String(order)}>{order}</option>
                ))}
            </select>

            <select name="type" value={filters.type || ''} onChange={handleChange} className="form-select">
                <option value="">Все разделы</option>
                {normalizedTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>

            <select name="difficulty" value={filters.difficulty || ''} onChange={handleChange} className="form-select">
                <option value="">Любая сложность</option>
                {normalizedDifficulties.map(level => (
                    <option key={level} value={String(level)}>{level}</option>
                ))}
            </select>

            <select name="author" value={filters.author || ''} onChange={handleChange} className="form-select">
                <option value="">Любой источник</option>
                {normalizedAuthors.map(author => (
                    <option key={author} value={author}>{author}</option>
                ))}
            </select>
        </div>
    );
};

export default TaskBankFilters;