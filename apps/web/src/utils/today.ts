/** Today as a plan day: 1 (Monday) to 7 (Sunday). JavaScript counts from Sunday (0). */
export function todayDay(): number {
  return ((new Date().getDay() + 6) % 7) + 1;
}
