import React, { useState } from 'react';

const InventoryBlock = ({ inventory, onUseItem, onRemoveItem }) => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAuthor, setFilterAuthor] = useState('all');
    const [searchName, setSearchName] = useState('');

    const authors = [...new Set(inventory.map(item => item.author).filter(Boolean))];

    const filteredInventory = inventory.filter(item => {
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (filterAuthor !== 'all' && item.author !== filterAuthor) return false;
        if (searchName && !item.name.toLowerCase().includes(searchName.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="profilePage_inventoryBlock">
            <h2 className="profilePage_section-title text">Мой инвентарь</h2>

            <div className="profilePage_filters">
                <div className="profilePage_filter">
                    <span className="profilePage_filter-label description_text">Статус:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="profilePage_filter-select description_text"
                    >
                        <option value="all">Все</option>
                        <option value="active">Активные</option>
                        <option value="inactive">Неактивные</option>
                    </select>
                </div>

                <div className="profilePage_filter">
                    <span className="profilePage_filter-label description_text">Автор:</span>
                    <select
                        value={filterAuthor}
                        onChange={(e) => setFilterAuthor(e.target.value)}
                        className="profilePage_filter-select description_text"
                    >
                        <option value="all">Все</option>
                        {authors.map(author => (
                            <option key={author} value={author}>{author}</option>
                        ))}
                    </select>
                </div>

                <div className="profilePage_filter">
                    <span className="profilePage_filter-label description_text">Поиск:</span>
                    <input
                        type="text"
                        placeholder="Название предмета"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="profilePage_filter-input description_text"
                    />
                </div>
            </div>

            <div className="profilePage_inventory">
                {filteredInventory.length === 0 ? (
                    <div className="profilePage_empty description_text">Нет предметов в инвентаре</div>
                ) : (
                    filteredInventory.map(item => (
                        <div key={item.id} className="profilePage_item">
                            <div className="profilePage_item-name text">{item.name}</div>
                            <div className="profilePage_item-author description_text">Автор: {item.author || 'Система'}</div>
                            <div className="profilePage_item-count text_mini">Количество: {item.quantity || 1}</div>
                            {item.status === 'active' ? (
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="profilePage_item-button remove btn_text"
                                >
                                    Снять
                                </button>
                            ) : (
                                <button
                                    onClick={() => onUseItem(item.id)}
                                    className="profilePage_item-button btn_text"
                                >
                                    Использовать
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InventoryBlock;