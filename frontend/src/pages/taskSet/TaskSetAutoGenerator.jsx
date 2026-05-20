import React from "react";
import "../../static/css/taskSetAutoGenerator.css";

import { useTasks } from "../../utils/taskSetAutoGenerator/useTasks";
import { useTaskSetGenerator } from "../../utils/taskSetAutoGenerator/useTaskSetGenerator";

import { AutoGeneratorHero } from "../../components/taskSetAutoGenerator/AutoGeneratorHero";
import { ModeSelector } from "../../components/taskSetAutoGenerator/ModeSelector";
import { NumberSelector } from "../../components/taskSetAutoGenerator/NumberSelector";

const TaskSetAutoGenerator = () => {
  const { tasks, loading, error } = useTasks();

  const {
    subject,
    setSubject,
    mode,
    setMode,
    selectedNumbers,
    name,
    setName,
    subjects,
    selectedSubjectLabel,
    availableNumbers,
    toggleNumber,
    handleSubmit,
    resetSelection,
  } = useTaskSetGenerator(tasks);

  if (loading) {
    return (
      <div className="adaptive-generator-page adaptive-generator-page_status">
        Загрузка данных для генерации комплекта...
      </div>
    );
  }

  if (error) {
    return (
      <div className="adaptive-generator-page adaptive-generator-page_status">
        {error}
      </div>
    );
  }

  return (
    <div className="adaptive-generator-page">
      <AutoGeneratorHero availableCount={availableNumbers.length} />

      <form
        onSubmit={handleSubmit}
        className="adaptive-generator-form"
      >
        <div className="adaptive-generator-form__grid">
          <label className="adaptive-generator-form__field">
            <span className="adaptive-generator-form__label text_mini">
              Название варианта
            </span>

            <input
              className="adaptive-generator-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="adaptive-generator-form__field">
            <span className="adaptive-generator-form__label text_mini">
              Предмет
            </span>

            <select
              className="adaptive-generator-form__input"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                resetSelection();
              }}
            >
              <option value="">Выберите предмет</option>
              {subjects.map((subj) => (
                <option key={subj.value} value={subj.value}>
                  {subj.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ModeSelector
          mode={mode}
          setMode={setMode}
          subject={subject}
        />

        <NumberSelector
          mode={mode}
          subject={subject}
          selectedSubjectLabel={selectedSubjectLabel}
          availableNumbers={availableNumbers}
          selectedNumbers={selectedNumbers}
          toggleNumber={toggleNumber}
        />

        <div className="adaptive-generator-form__actions">
          <button
            type="submit"
            className="adaptive-generator-form__submit btn_text"
            disabled={
              !subject ||
              (mode === "custom" &&
                selectedNumbers.length === 0)
            }
          >
            Сгенерировать и начать вариант
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskSetAutoGenerator;