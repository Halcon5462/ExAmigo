import { useState } from 'react';

const renumber = (obj) => {
  const sorted = Object.entries(obj).sort((a, b) => a[1] - b[1]);
  const result = {};

  sorted.forEach(([id], index) => {
    result[id] = index + 1;
  });

  return result;
};

export const useSelection = () => {
  const [selected, setSelected] = useState({});

  const toggleTask = (taskId) => {
    setSelected(prev => {
      const copy = { ...prev };

      if (copy[taskId]) {
        delete copy[taskId];
        return renumber(copy);
      }

      copy[taskId] = Object.keys(copy).length + 1;
      return copy;
    });
  };

  const changeOrder = (taskId, value) => {
    const order = Number(value);

    setSelected(prev => {
      const updated = { ...prev, [taskId]: order };
      return renumber(updated);
    });
  };

  const reset = () => setSelected({});

  return { selected, toggleTask, changeOrder, reset };
};