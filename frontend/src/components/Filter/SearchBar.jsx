import React, { useState, useEffect } from 'react';

const SearchBar = ({
  placeholder = 'Поиск...',
  onSearch,
  delay = 500
}) => {
  const [query, setQuery] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (query.trim() !== '') {
        onSearch?.(query);
      }
    }, delay);

    setTypingTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [query, delay, onSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      onSearch?.('');
    }
  };

  return (
    <div className="search-bar position-relative">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      <span className="search-icon position-absolute text-muted">🔍</span>
    </div>
  );
};

export default SearchBar;