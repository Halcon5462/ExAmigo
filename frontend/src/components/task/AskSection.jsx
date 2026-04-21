import React, { useState } from "react";
import api from "../../utils/api";

const AskSection = ({ taskId }) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!question.trim()) return;

        setLoading(true);

        try {
            const res = await api.post("/helpAi/ask/", {
                task_id: taskId,
                question
            });

            setAnswer(res.data.answer);

        } catch (err) {
            alert("Ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "15px" }}>
            <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Задать вопрос (100 💰)"
                style={{ width: "100%" }}
            />

            <button onClick={handleAsk}>
                {loading ? "Думаю..." : "Спросить"}
            </button>

            {answer && (
                <div style={{
                    marginTop: "10px",
                    background: "#eef",
                    padding: "10px",
                    borderRadius: "5px",
                    whiteSpace: "pre-line"
                }}>
                    <b>Ответ:</b>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default AskSection;