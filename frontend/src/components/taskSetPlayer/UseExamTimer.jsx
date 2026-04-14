import { useEffect, useState } from "react";

const useExamTimer = (isExam, examStartedAt, examTimeLimit) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!isExam) return;
    if (!examStartedAt || !examTimeLimit) return;

    const startedMs = Date.parse(examStartedAt);

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedMs) / 1000);
      const left = Math.max(0, Number(examTimeLimit) - elapsed);
      setTimeLeft(left);
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [examStartedAt, examTimeLimit, isExam]);

  return timeLeft;
};

export default useExamTimer;