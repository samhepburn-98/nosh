import { z } from 'zod';

/** The days of the week, Monday first. A day is stored as its number: 1 (Monday) to 7 (Sunday). */
export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const daySchema = z
  .int({ error: 'Choose a day.' })
  .min(1, { error: 'Choose a day from Monday to Sunday.' })
  .max(7, { error: 'Choose a day from Monday to Sunday.' });

/** "Monday" for 1, through "Sunday" for 7. */
export function dayName(day: number): string {
  return DAYS[day - 1] ?? '';
}
