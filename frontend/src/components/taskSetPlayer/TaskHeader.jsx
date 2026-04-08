const TaskHeader = ({ task, currentSet, isExam, timeLeft, formatTime, taskIndex, total }) => {
  return (
    <div className="task-info">
      <span>
        {task.subject_display || task.subject} · {currentSet.name}
        {isExam && timeLeft !== null
          ? ` · Осталось: ${formatTime(timeLeft)}`
          : ""}
      </span>

      <span className="progress">
        Задание {taskIndex + 1}/{total}
      </span>
    </div>
  );
};

export default TaskHeader;