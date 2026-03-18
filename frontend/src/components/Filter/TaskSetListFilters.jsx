import React, { useState } from 'react';
import FilterSection from './FilterSection';
import SearchBar from './SearchBar';

const TaskSetListFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    testType: 'Тип теста',
    difficulty: 'Сложность',
    taskCount: 'Кол-во заданий',
    author: 'Автор',
    kimTasks: 'Задания из КИМ',
    searchQuery: '',
  });

  const testTypeOptions = [
    { value: 'Тип теста', label: 'Тип теста' },
    { value: 'Математика', label: 'Математика' },
    { value: 'Русский язык', label: 'Русский язык' },
    { value: 'Физика', label: 'Физика' },
    { value: 'Информатика', label: 'Информатика' },
    { value: 'Обществознание', label: 'Обществознание' },
  ];

  const difficultyOptions = [
    { value: 'Сложность', label: 'Сложность' },
    { value: 'Легкая', label: 'Легкая' },
    { value: 'Средняя', label: 'Средняя' },
    { value: 'Высокая', label: 'Высокая' },
  ];

  const taskCountOptions = [
    { value: 'Кол-во заданий', label: 'Кол-во заданий' },
    { value: '1-5', label: '1-5 заданий' },
    { value: '6-10', label: '6-10 заданий' },
    { value: '11-15', label: '11-15 заданий' },
    { value: '16+', label: '16 и более' },
  ];

  const authorOptions = [
    { value: 'Автор', label: 'Автор' },
    { value: 'test1', label: 'test1' },
    { value: 'admin', label: 'admin' },
    { value: 'teacher', label: 'teacher' },
    { value: 'methodist', label: 'methodist' },
  ];

  const kimOptions = [
    { value: 'Задания из КИМ', label: 'Задания из КИМ' },
    { value: '1,2,3', label: '1, 2, 3' },
    { value: '4,5,6', label: '4, 5, 6' },
    { value: '7,8,9', label: '7, 8, 9' },
    { value: '10,11,12', label: '10, 11, 12' },
  ];

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="filters-container task-set-list-filters">
      <FilterSection
        title={filters.testType}
        options={testTypeOptions}
        selectedValue={filters.testType}
        onSelect={(val) => updateFilter('testType', val)}
      />
      <FilterSection
        title={filters.difficulty}
        options={difficultyOptions}
        selectedValue={filters.difficulty}
        onSelect={(val) => updateFilter('difficulty', val)}
      />
      <FilterSection
        title={filters.taskCount}
        options={taskCountOptions}
        selectedValue={filters.taskCount}
        onSelect={(val) => updateFilter('taskCount', val)}
      />
      <FilterSection
        title={filters.author}
        options={authorOptions}
        selectedValue={filters.author}
        onSelect={(val) => updateFilter('author', val)}
      />
      <FilterSection
        title={filters.kimTasks}
        options={kimOptions}
        selectedValue={filters.kimTasks}
        onSelect={(val) => updateFilter('kimTasks', val)}
      />
      <SearchBar
        placeholder="Поиск комплектов..."
        value={filters.searchQuery}
        onChange={(val) => updateFilter('searchQuery', val)}
      />
    </div>
  );
};

export default TaskSetListFilters;