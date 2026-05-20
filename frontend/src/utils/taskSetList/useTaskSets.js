import { useEffect, useState } from "react";
import api from "../api";

export const useTaskSets = () => {
  const [tasksets, setTasksets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskSets = async () => {
      try {
        const resp = await api.get("/taskBank/tasksets/");
        setTasksets(resp.data);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить комплекты заданий");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskSets();
  }, []);

  return { tasksets, setTasksets, loading, error };
};