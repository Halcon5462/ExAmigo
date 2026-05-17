import React from "react";

export default function HomePage() {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.25), transparent 55%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.2), transparent 60%)",
          backdropFilter: "blur(5px)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <h1 className="text" style={{ fontSize: "42px", fontWeight: 700 }}>
            Подготовка к экзаменам — это не зубрёжка.
            <br />
            Это система, игра и прогресс.
          </h1>

          <p className="description_text" style={{ marginTop: "24px", maxWidth: "700px", marginLeft: "auto", marginRight: "auto" }}>
            Мы объединили нарешивание заданий, соревнования и современные ИИ-инструменты,
            чтобы подготовка к ЕГЭ стала понятной, мотивирующей и эффективной.
          </p>

          <div style={{ marginTop: "32px", display: "flex", justifyContent: "center", gap: "16px" }}>
            <a href='/tasks'><button className="btn_green">Начать тренировку</button></a>
          </div>
        </section>

        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <div className="text" style={{ fontWeight: 600 }}>Соревнования</div>
            <div className="description_text" style={{ marginTop: "8px" }}>
              Дуэли через WebSocket создают соревновательный дух и мотивируют решать быстрее.
            </div>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <div className="text" style={{ fontWeight: 600 }}>Статистика</div>
            <div className="description_text" style={{ marginTop: "8px" }}>
              Графики показывают слабые и сильные задания, помогая учиться точечно.
            </div>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <div className="text" style={{ fontWeight: 600 }}>ИИ-подсказки</div>
            <div className="description_text" style={{ marginTop: "8px" }}>
              DeepSeek помогает понять задачу от намёка до полного решения.
            </div>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <div className="text" style={{ fontWeight: 600 }}>Геймификация</div>
            <div className="description_text" style={{ marginTop: "8px" }}>
              Ачивки и валюта превращают подготовку в игру, а не рутину.
            </div>
          </div>
        </section>

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
      </div>
    </div>
  );
}
