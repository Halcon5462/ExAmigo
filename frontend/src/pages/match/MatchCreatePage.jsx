import React, { useRef, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "../../static/css/match.css";

const MatchCreatePage = () => {
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("idle");
    const [joinMatchId, setJoinMatchId] = useState("");
    const [currentMatchId, setCurrentMatchId] = useState(null);

    const socketRef = useRef(null);
    const navigate = useNavigate();

    const subjectOptions = [
        { value: "", label: "Выберите предмет" },
        { value: "prof_math", label: "Математика" },
        { value: "russian", label: "Русский язык" },
    ];

    const statusTextMap = {
        connecting: {
            title: "Подключение к комнате",
            description: "Создаём соединение и подготавливаем матч к старту.",
        },
        waiting: {
            title: "Ожидание соперника",
            description: "Скопируйте ID матча и отправьте его второму игроку.",
        },
    };

    const connectToMatch = (matchId) => {
        setShowModal(true);
        setStatus("connecting");

        const token = localStorage.getItem("access");

        const socket = new WebSocket(
            `ws://localhost:8000/ws/match/${matchId}/?token=${token}`
        );

        socket.onopen = () => {
            setStatus("waiting");

            socket.send(JSON.stringify({
                action: "join",
                subject: subject || null,
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "match_start") {
                const user = JSON.parse(localStorage.getItem("user"));
                const userId = user.id;

                const examData = data.exam_data;
                const examId = examData.players[userId];
                const tasksetId = examData.taskset_id;
                const totalTasks = examData.total_tasks;

                navigate(`/match/play/${matchId}`, {
                    state: { examId, tasksetId, totalTasks },
                });
            }
        };

        socketRef.current = socket;
    };

    const handleCreateMatch = async () => {
        try {
            setLoading(true);

            const matchResp = await api.post("/match/create/", {
                subject,
            });
            const matchId = matchResp.data.match_id;
            setCurrentMatchId(matchId);

            connectToMatch(matchId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMatch = () => {
        if (!joinMatchId) {
            alert("Введите ID матча");
            return;
        }

        setCurrentMatchId(joinMatchId);
        connectToMatch(joinMatchId);
    };

    return (
        <div className="match-page">
            <section className="match-page__hero">
                <div>
                    <span className="match-page__eyebrow text_mini">PvP режим</span>
                    <h1 className="match-page__title text">Матчи один на один</h1>
                    <p className="match-page__description description_text">
                        Создайте комнату, выберите предмет и запустите соревновательный режим
                        на том же наборе заданий, который получит соперник.
                    </p>
                </div>

                <div className="match-page__hero-badge">
                    <span className="text_mini">Текущий статус</span>
                    <strong>{showModal ? "Комната открыта" : "Готов к старту"}</strong>
                </div>
            </section>

            <div className="match-page__grid">
                <section className="match-page__section">
                    <h2 className="match-page__section-title text">Создать матч</h2>
                    <p className="match-page__section-description description_text">
                        Хост создаёт комнату и отправляет ID второму участнику.
                    </p>

                    <div className="match-page__form">
                        <label className="match-page__field">
                            <span className="match-page__label text_mini">Предмет</span>
                            <select
                                className="match-page__select"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            >
                                {subjectOptions.map((option) => (
                                    <option key={option.value || "default"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="match-page__actions">
                            <button
                                type="button"
                                className="match-page__button btn_text"
                                onClick={handleCreateMatch}
                                disabled={loading}
                            >
                                {loading ? "Создание..." : "Создать матч"}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="match-page__section">
                    <h2 className="match-page__section-title text">Подключиться к матчу</h2>
                    <p className="match-page__section-description description_text">
                        Введите ID комнаты, который прислал вам соперник, и подключитесь к матчу.
                    </p>

                    <div className="match-page__form">
                        <label className="match-page__field">
                            <span className="match-page__label text_mini">ID матча</span>
                            <input
                                className="match-page__input"
                                type="text"
                                placeholder="Например: 42"
                                value={joinMatchId}
                                onChange={(e) => setJoinMatchId(e.target.value)}
                            />
                        </label>

                        <div className="match-page__actions">
                            <button
                                type="button"
                                className="match-page__button-secondary btn_text"
                                onClick={handleJoinMatch}
                            >
                                Подключиться
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <section className="match-page__section" style={{ marginTop: "24px" }}>
                <h2 className="match-page__section-title text">Как проходит матч</h2>
                <div className="match-page__tips">
                    <div className="match-page__tip">
                        <strong className="text">1. Общий вариант</strong>
                        <span className="description_text">
                            После подключения обоим игрокам выдаётся один и тот же набор заданий.
                        </span>
                    </div>
                    <div className="match-page__tip">
                        <strong className="text">2. Живой прогресс</strong>
                        <span className="description_text">
                            Во время решения видно, как соперник проходит задачи и где ошибается.
                        </span>
                    </div>
                    <div className="match-page__tip">
                        <strong className="text">3. Итоговый разбор</strong>
                        <span className="description_text">
                            После завершения отображается счёт и таблица по всем заданиям.
                        </span>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="match-page__modal">
                    <div className="match-page__modal-card">
                        <span className="match-page__eyebrow text_mini">Комната матча</span>
                        <h3 className="text">Матч создан</h3>
                        <p className="description_text">
                            Комната уже открыта. Передайте идентификатор сопернику и дождитесь его подключения.
                        </p>

                        <div className="match-page__modal-id">
                            <span className="text_mini">ID матча</span>
                            <strong>{currentMatchId || joinMatchId}</strong>
                        </div>

                        {status !== "idle" && (
                            <div className="match-page__status">
                                <span className="match-page__status-indicator" />
                                <div>
                                    <strong className="text">
                                        {statusTextMap[status]?.title || "Подготовка комнаты"}
                                    </strong>
                                    <div className="description_text">
                                        {statusTextMap[status]?.description || "Ожидаем обновления статуса матча."}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="match-page__actions">
                            <button
                                type="button"
                                className="match-page__button-secondary btn_text"
                                onClick={() => setShowModal(false)}
                            >
                                Скрыть окно
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchCreatePage;
