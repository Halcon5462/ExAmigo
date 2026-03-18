import React from 'react';

const SearchBar = ({ placeholder, value, onChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder || 'Поиск...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;