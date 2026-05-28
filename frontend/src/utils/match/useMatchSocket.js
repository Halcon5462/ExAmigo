import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebSocketUrl } from "../websocket_url";

export const useMatchSocket = ({
  subject,
  setShowModal,
  setStatus,
}) => {
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const connectToMatch = (matchId) => {
    setShowModal(true);
    setStatus("connecting");

    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      buildWebSocketUrl(
        `/ws/match/${matchId}/?token=${encodeURIComponent(token || "")}`
      )
    );

    socket.onopen = () => {
      setStatus("waiting");

      socket.send(
        JSON.stringify({
          action: "join",
          subject: subject || null,
        })
      );
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

  return { connectToMatch, socketRef };
};
