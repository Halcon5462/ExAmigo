import React from "react";
import useStreak from "../../utils/streak/useStreak";

const Streak = () => {
    const streak = useStreak();

    const isActiveToday = () => {
        if (!streak.lastActivityDate) return false;
        const today = new Date().toISOString().split("T")[0];
        return streak.lastActivityDate === today;
    };

    if (streak.loading) return null;

    return (
        <div className="streak">
            <span className={`streak_fire ${isActiveToday() ? "active" : ""}`}>
                <svg viewBox="0 0 24 24" className="streak_icon">
                    <path d="M12 2C10 6 13 7 13 10C13 12 11 13 11 15C11 17 13 18 13 20C13 22 10 23 8 23C4 23 2 20 2 16C2 11 6 7 9 4C9 7 11 8 12 8C13 8 14 7 14 2C13 2 12 2 12 2Z"/>
                </svg>
            </span>

            <span className="streak_count">{streak.current}</span>
        </div>
    );
};

export default Streak;