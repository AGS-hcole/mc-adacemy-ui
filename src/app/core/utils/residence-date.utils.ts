import { DateTime } from 'luxon';

const PARIS_ZONE = 'Europe/Paris';
const CUTOFF_HOUR = 12; // noon

/**
 * Get current time in Paris timezone
 */
export function nowParis(): DateTime {
    return DateTime.now().setZone(PARIS_ZONE);
}

/**
 * Convert DateTime to YYYY-MM-DD format
 */
export function toYmd(date: DateTime): string {
    return date.toISODate() || '';
}

/**
 * Check if current time is after cutoff for the given date
 * Cutoff is 12:00 (noon) Europe/Paris on the same day
 * @param ymd Date in YYYY-MM-DD format
 * @returns true if current time >= date at 12:00 Paris time
 */
export function isAfterCutoffForDate(ymd: string): boolean {
    const now = nowParis();
    const targetDate = DateTime.fromISO(ymd, { zone: PARIS_ZONE });

    if (!targetDate.isValid) {
        return false;
    }

    // Create cutoff datetime: the target date at 12:00 Paris time
    const cutoffTime = targetDate.set({
        hour: CUTOFF_HOUR,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    // Return true if now >= cutoff
    return now >= cutoffTime;
}

/**
 * Get start of week range for user page
 * Returns today's date
 */
export function startOfWeekRange(): DateTime {
    return nowParis().startOf('day');
}
