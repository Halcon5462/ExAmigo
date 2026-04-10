import { useState } from 'react';

const TaskStatCard = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getAccuracy = () => {
        if (!item.attempts_count) {
            return 0;
        }

        return Math.round((item.correct_count / item.attempts_count) * 100);
    };

    const wrongAnswers = item.attempts_count - item.correct_count;

    return (
        <div className="taskStatCard">
            <button
                type="button"
                className="taskStatCard_header"
                onClick={() => setIsOpen((prevState) => !prevState)}
            >
                <div className="taskStatCard_title text">Задание №{item.order_KIM}</div>
                <div className="taskStatCard_summary description_text">
                    ❌ {wrongAnswers} | ✅ {item.correct_count} | {getAccuracy()}%
                </div>
            </button>

            {isOpen && (
                <div className="taskStatCard_details">
                    <p className="description_text">Попытки: {item.attempts_count}</p>
                    <p className="description_text">Верные: {item.correct_count}</p>
                    <p className="description_text">С первого раза: {item.correct_first_try}</p>
                </div>
            )}
        </div>
    );
};

export default TaskStatCard;
