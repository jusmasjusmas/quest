import {
  getWhimForDate,
  type Whim,
  type WhimType,
  WHIMS,
} from "@/data/whims";

export { getWhimForDate, WHIMS } from "@/data/whims";

export type CatalogWhim = Whim;
export type { WhimType };

export const WHIMS_CATALOG = WHIMS;

/** @deprecated Use getWhimForDate; alias for app code that still imports getDailyWhim. */
export function getDailyWhim(date = new Date()): Whim {
  return getWhimForDate(date);
}
