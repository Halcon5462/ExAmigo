import { useMemo, useState } from "react";

export const useTaskSetFilters = (tasksets) => {
  const [filters, setFilters] = useState({
    testType: "",
    difficulty: "",
    taskCount: "",
    author: "",
    kimTasks: "",
    searchQuery: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const testTypes = useMemo(
    () => [...new Set(tasksets.map((ts) => ts.subject).filter(Boolean))],
    [tasksets]
  );

  const authors = useMemo(
    () =>
      [...new Set(
        tasksets
          .map(
            (ts) =>
              ts.author_name ||
              ts.author_email ||
              ts.author
          )
          .filter(Boolean)
      )],
    [tasksets]
  );

  const difficulties = useMemo(
    () =>
      [...new Set(
        tasksets
          .map((ts) => Math.round(ts.average_difficulty))
          .filter((d) => d > 0)
      )].sort((a, b) => a - b),
    [tasksets]
  );

  const taskCounts = useMemo(
    () =>
      [...new Set(
        tasksets
          .map((ts) => ts.items?.length || 0)
          .filter((c) => c > 0)
      )].sort((a, b) => a - b),
    [tasksets]
  );

  const filteredTaskSets = useMemo(() => {
    return tasksets.filter((ts) => {
      if (filters.testType && ts.subject !== filters.testType) return false;

      if (
        filters.difficulty &&
        Math.round(ts.average_difficulty) !== Number(filters.difficulty)
      )
        return false;

      if (
        filters.taskCount &&
        String(ts.items?.length || 0) !== filters.taskCount
      )
        return false;

      if (filters.author) {
        const authorValue =
          ts.author_name ||
          ts.author_email ||
          String(ts.author || "");

        if (authorValue !== filters.author) return false;
      }

      if (filters.kimTasks === "true" && !ts.kim_tasks) return false;
      if (filters.kimTasks === "false" && ts.kim_tasks) return false;

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!ts.name.toLowerCase().includes(q)) return false;
      }

      if (!ts.is_public) return false;

      return true;
    });
  }, [tasksets, filters]);

  return {
    filters,
    handleFilterChange,
    filteredTaskSets,
    testTypes,
    authors,
    difficulties,
    taskCounts,
  };
};