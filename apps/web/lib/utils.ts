import { differenceInMinutes, parseISO } from "date-fns";
import { format } from "date-fns";

export const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export function getMinutesLeft(endTime: string | Date): number {
  const parsedEnd = typeof endTime === "string" ? parseISO(endTime) : endTime;
  return Math.max(differenceInMinutes(parsedEnd, new Date()), 0);
}

/**
 * Format a date string or Date object to "dd MMM, yyyy"
 * @param date - a Date object or ISO string
 * @returns formatted date like "27 Jun, 2025"
 */
export function formatDateIntoDayMonthYear(date: string | Date): string {
  try {
    return format(new Date(date), "dd MMM, yyyy");
  } catch {
    return "";
  }
}
