/**
 * Ходы кошелька на матче (как на референсе: FLIPPED / ONLY EXITED):
 *  - "flipped"   — купил обе стороны (развернулся или захеджировался);
 *  - "only-exit" — только продажи: закрывал позицию, не заходил;
 *  - ""          — обычный вход.
 */
export type MoveTag = "" | "flipped" | "only-exit";

export function moveOf(buy: [number, number], sell: [number, number]): MoveTag {
  const anyBuy = buy[0] >= 50 || buy[1] >= 50;
  if (!anyBuy && sell[0] + sell[1] >= 50) return "only-exit";
  if (buy[0] >= 50 && buy[1] >= 50) return "flipped";
  return "";
}
