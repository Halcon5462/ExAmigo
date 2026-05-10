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
        (orders || []).map((o) => {
            const n = Number(o);
            return Number.isFinite(n) ? String(Math.round(n)) : String(o);
        }),
        (v) => v,
    );

    const normalizedTypes = uniqueBy(
        (types || []).map((t) => (typeof t === 'string' ? t.trim() : t)).filter(Boolean),
        (v) => v,
    );

    const normalizedDifficulties = uniqueBy(
        (difficulties || []).map((d) => {
            const n = Number(d);
            return Number.isFinite(n) ? String(Math.round(n)) : String(d);
        }),
        (v) => v,
    ).sort((a, b) => Number(a) - Number(b));

    const normalizedAuthors = uniqueBy(
        (authors || []).map((a) => (typeof a === 'string' ? a.trim() : a)).filter(Boolean),
        (v) => v,
    );

    const normalizedSubjects = uniqueBy(
        (subjects || []).filter((s) => s && s.value !== undefined && s.value !== null),
        (s) => String(s.value),
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="task-bank-filters">
            <label className="task-bank-filters__field">
                <span className="task-bank-filters__label text_mini">Предмет</span>
                <select name="subject" value={filters.subject || ''} onChange={handleChange} className="task-bank-filters__select">
                    <option value="">Все предметы</option>
                    {normalizedSubjects.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </label>

            <label className="task-bank-filters__field">
                <span className="task-bank-filters__label text_mini">Номер</span>
                <select name="orderKIM" value={filters.orderKIM || ''} onChange={handleChange} className="task-bank-filters__select">
                    <option value="">Все номера</option>
                    {normalizedOrders.map((order) => (
                        <option key={order} value={String(order)}>{order}</option>
                    ))}
                </select>
            </label>

            <label className="task-bank-filters__field">
                <span className="task-bank-filters__label text_mini">Раздел</span>
                <select name="type" value={filters.type || ''} onChange={handleChange} className="task-bank-filters__select">
                    <option value="">Все разделы</option>
                    {normalizedTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </label>

            <label className="task-bank-filters__field">
                <span className="task-bank-filters__label text_mini">Сложность</span>
                <select name="difficulty" value={filters.difficulty || ''} onChange={handleChange} className="task-bank-filters__select">
                    <option value="">Любая сложность</option>
                    {normalizedDifficulties.map((level) => (
                        <option key={level} value={String(level)}>{level}</option>
                    ))}
                </select>
            </label>

            <label className="task-bank-filters__field">
                <span className="task-bank-filters__label text_mini">Источник</span>
                <select name="author" value={filters.author || ''} onChange={handleChange} className="task-bank-filters__select">
                    <option value="">Любой источник</option>
                    {normalizedAuthors.map((author) => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>
            </label>
        </div>
    );
};

export default TaskBankFilters;
