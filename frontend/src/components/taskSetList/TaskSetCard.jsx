import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export const TaskSetCard = ({ set }) => {
  const navigate = useNavigate();

  const startExam = async (setId) => {
    try {
      const resp = await api.post(
        `/taskBank/tasksets/${setId}/start-exam/`
      );

      const examId = resp.data?.exam_id;
      navigate(`/tasksets/play/${setId}?exam=${examId}`);
    } catch (e) {
      console.error(e);
      alert("Не удалось начать экзамен");
    }
  };

  const getDifficultyName = (level) => {
    if (level === 1) return "Легкая";
    if (level === 2) return "Средняя";
    if (level === 3) return "Высокая";
    return `Уровень ${level}`;
  };

  return (
    <div className="taskset-card">
      <h3 className="taskset-card_title">{set.name}</h3>

      <p>
        <strong>Тип:</strong> {set.type}
      </p>

      <div className="taskset-card_info">
        <div className="taskset-card_info-item">
          <span className="taskset-card_info-label">Автор:</span>
          <span>
            {set.author_name ||
              set.author_email ||
              "Аноним"}
          </span>
        </div>

        <div className="taskset-card_info-item">
          <span className="taskset-card_info-label">Заданий:</span>
          <span>{set.items?.length || 0}</span>
        </div>

        <div className="taskset-card_info-item">
          <span className="taskset-card_info-label">
            Сложность:
          </span>
          <span>
            {getDifficultyName(
              Math.round(set.average_difficulty)
            )}
          </span>
        </div>

        <div className="taskset-card_info-item">
          <span className="taskset-card_info-label">
            Предмет:
          </span>
          <span>
            {set.subject_display || set.subject}
          </span>
        </div>
      </div>

      {set.kim_tasks && (
        <div className="taskset-card_kim description_text">
          Задания из КИМ: {set.kim_tasks}
        </div>
      )}

      {set.type === "exam" ? (
        <button
          className="taskset-card_button btn_text"
          onClick={() => startExam(set.id)}
        >
          Начать экзамен
        </button>
      ) : (
        <button
          className="taskset-card_button btn_text"
          onClick={() =>
            navigate(`/tasksets/play/${set.id}`)
          }
        >
          Начать
        </button>
      )}
    </div>
  );
};