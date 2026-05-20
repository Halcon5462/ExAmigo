import React, { useState } from "react";
import api from "../../utils/api";

import "../../static/css/match.css";

import { MatchCreateHero } from "../../components/match/MatchCreateHero";
import { CreateMatchForm } from "../../components/match/CreateMatchForm";
import { JoinMatchForm } from "../../components/match/JoinMatchForm";
import { MatchInfoTips } from "../../components/match/MatchInfoTips";
import { MatchModal } from "../../components/match/MatchModal";

import { useMatchSocket } from "../../utils/match/useMatchSocket";

const MatchCreatePage = () => {
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("idle");
  const [joinMatchId, setJoinMatchId] = useState("");
  const [currentMatchId, setCurrentMatchId] = useState(null);

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

  const { connectToMatch } = useMatchSocket({
    subject,
    setShowModal,
    setStatus,
    setCurrentMatchId,
  });

  const handleCreateMatch = async () => {
    try {
      setLoading(true);

      const resp = await api.post("/match/create/", {
        subject,
      });

      const matchId = resp.data.match_id;
      setCurrentMatchId(matchId);

      connectToMatch(matchId);
    } catch (e) {
      console.error(e);
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
      <MatchCreateHero showModal={showModal} />

      <div className="match-page__grid">
        <CreateMatchForm
          subject={subject}
          setSubject={setSubject}
          subjectOptions={subjectOptions}
          handleCreateMatch={handleCreateMatch}
          loading={loading}
        />

        <JoinMatchForm
          joinMatchId={joinMatchId}
          setJoinMatchId={setJoinMatchId}
          handleJoinMatch={handleJoinMatch}
        />
      </div>

      <MatchInfoTips />

      <MatchModal
        showModal={showModal}
        setShowModal={setShowModal}
        currentMatchId={currentMatchId}
        joinMatchId={joinMatchId}
        status={status}
        statusTextMap={statusTextMap}
      />
    </div>
  );
};

export default MatchCreatePage;