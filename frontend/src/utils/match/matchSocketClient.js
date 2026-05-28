import { useEffect, useRef } from "react";
import { buildWebSocketUrl } from "../websocket_url";

export default function useMatchSocketClient(matchId, myId, onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      buildWebSocketUrl(
        `/ws/match/${matchId}/?token=${encodeURIComponent(token || "")}`
      )
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessageRef.current?.(data);
    };

    socketRef.current = socket;

    return () => socket.close();
  }, [matchId, myId]);

  return socketRef;
}
