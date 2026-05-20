import React from "react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Соревнования",
      text: "Дуэли через WebSocket создают соревновательный дух и мотивируют решать быстрее.",
    },
    {
      title: "Статистика",
      text: "Графики показывают слабые и сильные задания, помогая учиться точечно.",
    },
    {
      title: "ИИ-подсказки",
      text: "DeepSeek помогает понять задачу от намёка до полного решения.",
    },
    {
      title: "Геймификация",
      text: "Ачивки и валюта превращают подготовку в игру, а не рутину.",
    },
  ];

  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
      }}
    >
      {features.map((f) => (
        <div
          key={f.title}
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <div className="text" style={{ fontWeight: 600 }}>
            {f.title}
          </div>
          <div className="description_text" style={{ marginTop: "8px" }}>
            {f.text}
          </div>
        </div>
      ))}
    </section>
  );
}