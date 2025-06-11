import { differenceInMinutes, parseISO } from "date-fns";

export const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export function getMinutesLeft(endTime: string | Date): number {
  const parsedEnd = typeof endTime === "string" ? parseISO(endTime) : endTime;
  return Math.max(differenceInMinutes(parsedEnd, new Date()), 0);
}
