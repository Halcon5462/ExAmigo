import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export const useTaskSetGenerator = (tasks) => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState("full");
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [name, setName] = useState("");

  const subjects = useMemo(() => {
    return [
      ...new Map(
        tasks
          .filter((t) => t.subject)
          .map((t) => [t.subject, t.subject_display || t.subject])
      ).entries(),
    ].map(([value, label]) => ({ value, label }));
  }, [tasks]);

  const selectedSubjectLabel =
    subjects.find((s) => s.value === subject)?.label || subject;

  const availableNumbers = useMemo(() => {
    if (!subject) return [];

    return [...new Set(
      tasks
        .filter((t) => t.subject === subject && t.order_KIM != null)
        .map((t) => t.order_KIM)
    )].sort((a, b) => a - b);
  }, [tasks, subject]);

  const toggleNumber = (num) => {
    setSelectedNumbers((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject) {
      alert("Выберите предмет");
      return;
    }

    const payload = {
      subject,
      mode,
      task_numbers: mode === "custom" ? selectedNumbers : [],
      name: name || undefined,
    };

    try {
      const resp = await api.post(
        "/taskBank/tasksets/generate/",
        payload
      );

      const created = resp.data;

      if (created?.id) {
        navigate(`/tasksets/play/${created.id}`);
      } else {
        alert("Не удалось определить ID");
      }
    } catch (e) {
      console.error(e);
      const detail =
        e.response?.data?.detail ||
        "Ошибка при генерации комплекта";
      alert(detail);
    }
  };

  const resetSelection = () => setSelectedNumbers([]);

  return {
    subject,
    setSubject,
    mode,
    setMode,
    selectedNumbers,
    setSelectedNumbers,
    name,
    setName,
    subjects,
    selectedSubjectLabel,
    availableNumbers,
    toggleNumber,
    handleSubmit,
    resetSelection,
  };
};