import React from "react";

export default function BackgroundGlow() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.25), transparent 55%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.2), transparent 60%)",
        backdropFilter: "blur(5px)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}