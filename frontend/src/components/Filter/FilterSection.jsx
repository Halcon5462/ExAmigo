import React, { useState } from 'react';

const FilterSection = ({ title, options, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="filter-section">
      <div className="filter-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="filter-title">{title}</span>
        <span className={`filter-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <ul className="filter-dropdown">
          {options.map((option) => (
            <li
              key={option.value}
              className={`filter-option ${selectedValue === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterSection;