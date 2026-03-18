import React, { useState } from 'react';
import FilterSection from './FilterSection';
import SearchBar from './SearchBar';

const TaskBankFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    subject: 'Все предметы',
    taskNumber: 'Все номера',
    section: 'Все разделы',
    difficulty: 'Любая сложность',
    source: 'Любой источник',
    searchQuery: '',
  });

  const subjectOptions = [
    { value: 'Все предметы', label: 'Все предметы' },
    { value: 'Профильная математика', label: 'Профильная математика' },
    { value: 'Базовая математика', label: 'Базовая математика' },
    { value: 'Русский язык', label: 'Русский язык' },
  ];

  const numberOptions = [
    { value: 'Все номера', label: 'Все номера' },
    { value: '1', label: 'Задание №1' },
    { value: '2', label: 'Задание №2' },
  ];

  const sectionOptions = [
    { value: 'Все разделы', label: 'Все разделы' },
    { value: 'Планиметрия', label: 'Планиметрия' },
    { value: 'Стереометрия', label: 'Стереометрия' },
  ];

  const difficultyOptions = [
    { value: 'Любая сложность', label: 'Любая сложность' },
    { value: '1', label: 'Легкая' },
    { value: '2', label: 'Средняя' },
    { value: '3', label: 'Высокая' },
  ];

  const sourceOptions = [
    { value: 'Любой источник', label: 'Любой источник' },
    { value: 'ФИПИ', label: 'ФИПИ' },
    { value: 'СтатГрад', label: 'СтатГрад' },
  ];

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSearch = (query) => {
    updateFilter('searchQuery', query);
  };

  return (
    <div className="filters-container task-bank-filters">
      <FilterSection
        title={filters.subject}
        options={subjectOptions}
        selectedValue={filters.subject}
        onSelect={(val) => updateFilter('subject', val)}
      />
      <FilterSection
        title={filters.taskNumber}
        options={numberOptions}
        selectedValue={filters.taskNumber}
        onSelect={(val) => updateFilter('taskNumber', val)}
      />
      <FilterSection
        title={filters.section}
        options={sectionOptions}
        selectedValue={filters.section}
        onSelect={(val) => updateFilter('section', val)}
      />
      <FilterSection
        title={filters.difficulty}
        options={difficultyOptions}
        selectedValue={filters.difficulty}
        onSelect={(val) => updateFilter('difficulty', val)}
      />
      <FilterSection
        title={filters.source}
        options={sourceOptions}
        selectedValue={filters.source}
        onSelect={(val) => updateFilter('source', val)}
      />
      <SearchBar
        placeholder="Поиск по названию..."
        value={filters.searchQuery}
        onChange={handleSearch}
      />
      <button className="filter-button" onClick={() => console.log('Применить фильтры', filters)}>
        Показать
      </button>
    </div>
  );
};

export default TaskBankFilters;