import React from "react";

export default function HeroSection() {
  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <h1 className="text" style={{ fontSize: "42px", fontWeight: 700 }}>
        Подготовка к экзаменам — это не зубрёжка.
        <br />
        Это система, игра и прогресс.
      </h1>

      <p
        className="description_text"
        style={{
          marginTop: "24px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Мы объединили нарешивание заданий, соревнования и современные ИИ-инструменты,
        чтобы подготовка к ЕГЭ стала понятной, мотивирующей и эффективной.
      </p>

      <div
        style={{
          marginTop: "32px",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <a href="/tasks">
          <button className="btn_green">Начать тренировку</button>
        </a>
      </div>
    </section>
  );
}