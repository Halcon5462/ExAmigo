import React from 'react';

const FilterSection = ({ name, value, options, onChange, placeholder = "Все" }) => {
    return (
        <div className="filter-section">
            <select
                name={name}
                value={value || ''}
                onChange={onChange}
                className="form-select"
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterSection;