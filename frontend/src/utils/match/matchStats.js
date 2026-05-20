import { useMemo } from "react";

export const useMatchStats = (myChecked, opponentProgress) => {
  const myCorrectCount = useMemo(
    () => Object.values(myChecked).filter(Boolean).length,
    [myChecked]
  );

  const opponentAnsweredCount = useMemo(
    () => Object.keys(opponentProgress).length,
    [opponentProgress]
  );

  const opponentCorrectCount = useMemo(
    () => Object.values(opponentProgress).filter(Boolean).length,
    [opponentProgress]
  );

  return {
    myCorrectCount,
    opponentAnsweredCount,
    opponentCorrectCount,
  };
};