import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format a date using dayjs
 * @param date - Date object, ISO string, or timestamp
 * @param format - Date format string (default: 'MMMM D, YYYY')
 * @returns Formatted date string
 * @example formatDate(new Date()) // "December 16, 2025"
 * @example formatDate('2025-12-16', 'DD/MM/YYYY') // "16/12/2025"
 */
export const formatDate = (date: Date | string | number, format: string = "MMMM D, YYYY"): string => {
    return dayjs(date).format(format);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date object, ISO string, or timestamp
 * @returns Relative time string
 * @example formatRelativeTime(new Date()) // "just now"
 * @example formatRelativeTime('2025-12-14') // "2 days ago"
 */
export const formatRelativeTime = (date: Date | string | number): string => {
    return dayjs(date).fromNow();
};

/**
 * Check if a value is a valid date
 * @param date - Any value to check
 * @returns True if valid date
 */
export const isValidDate = (date: unknown): boolean => {
    if (date === null || date === undefined) return false;
    return dayjs(date as string | number | Date).isValid();
};

/**
 * Parse a date string with a specific format
 * @param dateString - Date string to parse
 * @param format - Expected format
 * @returns dayjs object
 * @example parseDate('16/12/2025', 'DD/MM/YYYY')
 */
export const parseDate = (dateString: string, format: string) => {
    return dayjs(dateString, format);
};

/**
 * Get difference between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit of difference (default: 'day')
 * @returns Difference in specified unit
 * @example getDifference('2025-12-20', '2025-12-16') // 4 (days)
 */
export const getDifference = (
    date1: Date | string | number,
    date2: Date | string | number,
    unit: dayjs.UnitType = "day"
): number => {
    return dayjs(date1).diff(dayjs(date2), unit);
};

/**
 * Add time to a date
 * @param date - Base date
 * @param amount - Amount to add
 * @param unit - Unit to add (default: 'day')
 * @returns New date
 * @example addTime(new Date(), 7, 'day') // 7 days from now
 */
export const addTime = (date: Date | string | number, amount: number, unit: dayjs.ManipulateType = "day"): Date => {
    return dayjs(date).add(amount, unit).toDate();
};

/**
 * Subtract time from a date
 * @param date - Base date
 * @param amount - Amount to subtract
 * @param unit - Unit to subtract (default: 'day')
 * @returns New date
 * @example subtractTime(new Date(), 7, 'day') // 7 days ago
 */
export const subtractTime = (
    date: Date | string | number,
    amount: number,
    unit: dayjs.ManipulateType = "day"
): Date => {
    return dayjs(date).subtract(amount, unit).toDate();
};

/**
 * Get start of a time period
 * @param date - Date to process
 * @param unit - Unit (day, week, month, year)
 * @returns Start of the period
 * @example startOf(new Date(), 'month') // First day of current month
 */
export const startOf = (date: Date | string | number, unit: dayjs.OpUnitType): Date => {
    return dayjs(date).startOf(unit).toDate();
};

/**
 * Get end of a time period
 * @param date - Date to process
 * @param unit - Unit (day, week, month, year)
 * @returns End of the period
 * @example endOf(new Date(), 'month') // Last day of current month
 */
export const endOf = (date: Date | string | number, unit: dayjs.OpUnitType): Date => {
    return dayjs(date).endOf(unit).toDate();
};

/**
 * Check if a date is before another date
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is before date2
 */
export const isBefore = (date1: Date | string | number, date2: Date | string | number): boolean => {
    return dayjs(date1).isBefore(dayjs(date2));
};

/**
 * Check if a date is after another date
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is after date2
 */
export const isAfter = (date1: Date | string | number, date2: Date | string | number): boolean => {
    return dayjs(date1).isAfter(dayjs(date2));
};

/**
 * Check if a date is the same as another date
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit to compare (default: 'day')
 * @returns True if dates are the same
 */
export const isSame = (
    date1: Date | string | number,
    date2: Date | string | number,
    unit: dayjs.OpUnitType = "day"
): boolean => {
    return dayjs(date1).isSame(dayjs(date2), unit);
};

/**
 * Convert date to ISO string
 * @param date - Date to convert
 * @returns ISO string
 */
export const toISOString = (date: Date | string | number): string => {
    return dayjs(date).toISOString();
};

/**
 * Get current date/time
 * @returns Current date
 */
export const now = (): Date => {
    return dayjs().toDate();
};

/**
 * Format date with timezone
 * @param date - Date to format
 * @param timezone - Timezone (e.g., 'America/New_York')
 * @param format - Date format
 * @returns Formatted date string in specified timezone
 */
export const formatWithTimezone = (
    date: Date | string | number,
    timezone: string,
    format: string = "YYYY-MM-DD HH:mm:ss"
): string => {
    return dayjs(date).tz(timezone).format(format);
};
