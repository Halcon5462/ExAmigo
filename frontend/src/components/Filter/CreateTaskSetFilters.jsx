const CreateTaskSetFilters = ({ tasks, filters, onFilterChange }) => {
    const orders = [...new Set(tasks.map(t => t.order_KIM).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const types = [...new Set(tasks.map(t => t.type).filter(Boolean))];
    const difficulties = [...new Set(tasks.map(t => t.difficulty).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const authors = [...new Set(tasks.map(t => t.author_name || t.author_email || t.author).filter(Boolean))];

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="create-task-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
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

            <button className="btn btn-primary" type="button" onClick={() => onFilterChange('apply', true)}>
                Фильтровать
            </button>
        </div>
    );
};

export default CreateTaskSetFilters;