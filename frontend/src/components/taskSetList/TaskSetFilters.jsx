export const TaskSetFilters = ({
  filters,
  handleFilterChange,
  testTypes,
  difficulties,
  taskCounts,
  authors,
}) => {
  return (
    <div className="taskset-filters">
      <select
        name="testType"
        value={filters.testType}
        onChange={handleFilterChange}
      >
        <option value="">Предмет</option>
        {testTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        name="difficulty"
        value={filters.difficulty}
        onChange={handleFilterChange}
      >
        <option value="">Сложность</option>
        {difficulties.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      <select
        name="taskCount"
        value={filters.taskCount}
        onChange={handleFilterChange}
      >
        <option value="">Кол-во заданий</option>
        {taskCounts.map((count) => (
          <option key={count} value={count}>
            {count}
          </option>
        ))}
      </select>

      <select
        name="author"
        value={filters.author}
        onChange={handleFilterChange}
      >
        <option value="">Автор</option>
        {authors.map((author) => (
          <option key={author} value={author}>
            {author}
          </option>
        ))}
      </select>

      <select
        name="kimTasks"
        value={filters.kimTasks}
        onChange={handleFilterChange}
      >
        <option value="">Задания из КИМ</option>
        <option value="true">Да</option>
        <option value="false">Нет</option>
      </select>

      <input
        type="text"
        name="searchQuery"
        placeholder="Поиск..."
        value={filters.searchQuery}
        onChange={handleFilterChange}
        className="taskset-filters_search"
      />
    </div>
  );
};