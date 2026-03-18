import React, { useState } from 'react';
import FilterSection from './FilterSection';
import SearchBar from './SearchBar';

const CreateTaskSetFilters = ({ onFilterChange }) => {
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
    { value: 'Физика', label: 'Физика' },
    { value: 'Информатика', label: 'Информатика' },
  ];

  const numberOptions = [
    { value: 'Все номера', label: 'Все номера' },
    { value: '1', label: 'Задание №1' },
    { value: '2', label: 'Задание №2' },
    { value: '3', label: 'Задание №3' },
    { value: '4', label: 'Задание №4' },
    { value: '5', label: 'Задание №5' },
    { value: '6', label: 'Задание №6' },
    { value: '7', label: 'Задание №7' },
    { value: '8', label: 'Задание №8' },
    { value: '9', label: 'Задание №9' },
    { value: '10', label: 'Задание №10' },
    { value: '11', label: 'Задание №11' },
    { value: '12', label: 'Задание №12' },
  ];

  const sectionOptions = [
    { value: 'Все разделы', label: 'Все разделы' },
    { value: 'Планиметрия', label: 'Планиметрия' },
    { value: 'Стереометрия', label: 'Стереометрия' },
    { value: 'Теория вероятностей', label: 'Теория вероятностей' },
    { value: 'Уравнения', label: 'Уравнения' },
    { value: 'Неравенства', label: 'Неравенства' },
    { value: 'Функции', label: 'Функции' },
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
    { value: 'Решу ЕГЭ', label: 'Решу ЕГЭ' },
    { value: 'Авторские', label: 'Авторские' },
  ];

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="filters-container create-task-filters">
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
        placeholder="Поиск заданий..."
        value={filters.searchQuery}
        onChange={(val) => updateFilter('searchQuery', val)}
      />
      <button className="filter-button" onClick={() => console.log('Фильтры для создания:', filters)}>
        Фильтровать
      </button>
    </div>
  );
};

export default CreateTaskSetFilters;