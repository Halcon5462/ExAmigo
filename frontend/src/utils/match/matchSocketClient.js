import { useEffect, useRef } from "react";

export default function matchSocketClient(matchId, myId, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const socket = new WebSocket(
      `ws://${window.location.hostname}:8000/ws/match/${matchId}/?token=${token}`
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    };

    socketRef.current = socket;

    return () => socket.close();
  }, [matchId, myId]);

  return socketRef;
}