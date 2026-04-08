import { ArrowRightCircle, ArrowLeftCircle } from "lucide-react";

const TaskNavigation = ({ taskIndex, tasksLength, goTo, finishExam }) => {
  return (
    <div className="set-nav">
      {taskIndex !== 0 && (
        <ArrowLeftCircle
          className="arrow"
          size={40}
          onClick={() => goTo(taskIndex - 1)}
        />
      )}

      {taskIndex < tasksLength - 1 ? (
        <ArrowRightCircle
          className="arrow"
          size={40}
          onClick={() => goTo(taskIndex + 1)}
        />
      ) : (
        <button className="btn_green" onClick={finishExam}>
          Завершить
        </button>
      )}
    </div>
  );
};

export default TaskNavigation;