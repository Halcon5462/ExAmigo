import { useState } from 'react';

export const useFilters = () => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => setFilters({});

  return { filters, handleFilterChange, resetFilters };
};