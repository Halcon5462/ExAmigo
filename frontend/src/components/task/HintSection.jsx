import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const HintSection = ({ taskId }) => {
    const [hints, setHints] = useState({});
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState({});

    useEffect(() => {
        api.get("/helpAi/prices/").then(res => {
            setPrices(res.data);
        });
    }, []);

    const handleGetHint = async (level) => {
        if (hints[level]) {
            setSelectedLevel(level);
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/helpAi/hint/", {
                task_id: taskId,
                level,
            });

            setHints(prev => ({
                ...prev,
                [level]: res.data.hint
            }));

            setSelectedLevel(level);

        } catch (err) {
            alert(err.response?.data?.error || "Ошибка");
        } finally {
            setLoading(false);
        }
    };

    const getText = (level) => {
        if (loading) return "Думаем...";
        if (hints[level]) return "✓";
        return `-${prices[level] ?? "?"} 💰`;
    };

    return (
        <div style={{ marginTop: "15px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
                {[1,2,3].map(level => (
                    <button key={level} onClick={() => handleGetHint(level)}>
                        Уровень {level} {getText(level)}
                    </button>
                ))}
            </div>

            {Object.keys(hints).length > 0 && (
                <div style={{ marginTop: "10px" }}>
                    {Object.entries(hints).map(([lvl, text]) => (
                        <div
                            key={lvl}
                            style={{
                                background: selectedLevel == lvl ? "#e6f7ff" : "#f9f9f9",
                                padding: "10px",
                                marginTop: "5px",
                                borderRadius: "5px"
                            }}
                        >
                            <b>Уровень {lvl}</b>
                            <p style={{ whiteSpace: "pre-line" }}>{text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HintSection;