export function calcFocusScore({
  distractions,
  idleSeconds,
  earlyTerminate
}: {
  distractions: number;
  idleSeconds: number;
  earlyTerminate: boolean;
}) {
  const idleMinutes = Math.floor(idleSeconds / 60);
  const base = 100;
  const penalty = distractions * 5 + idleMinutes * 2 + (earlyTerminate ? 10 : 0);
  return Math.max(0, base - penalty);
}
