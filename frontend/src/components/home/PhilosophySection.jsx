import React from "react";

export default function PhilosophySection() {
  return (
    <section style={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2 className="text" style={{ fontSize: "32px", fontWeight: 700 }}>
          Главное — не заучить, а понять
        </h2>

        <p className="description_text" style={{ marginTop: "24px" }}>
          Мы сами проходили путь подготовки к экзаменам и знаем, насколько сложно
          видеть реальный прогресс. Этот сервис создан, чтобы дать прозрачную картину знаний.
        </p>

        <p className="description_text" style={{ marginTop: "16px" }}>
          Решай. Соревнуйся. Анализируй. Расти.
        </p>
      </div>
    </section>
  );
}