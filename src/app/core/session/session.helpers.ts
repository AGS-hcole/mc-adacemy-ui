import { FormulaType } from '../user/user.types';
import { SessionSlot } from './session.types';

/**
 * Validates if a user's formula is compatible with a session slot
 * MORNING formula -> AM slots only
 * AFTERNOON formula -> PM slots only
 * FULL formula -> Both AM and PM slots
 */
export function isFormulaCompatibleWithSlot(
    formula: FormulaType | null | undefined,
    slot: SessionSlot
): boolean {
    if (!formula) {
        return false;
    }

    switch (formula) {
        case FormulaType.MORNING:
            return slot === SessionSlot.AM;
        case FormulaType.AFTERNOON:
            return slot === SessionSlot.PM;
        case FormulaType.FULL:
            return true;
        default:
            return false;
    }
}

/**
 * Check if registration cutoff has passed
 * Cutoff is Friday 18:00 (6 PM) before the session
 * Returns true if cutoff has passed (registration blocked)
 */
export function isCutoffPassed(sessionDate: Date | string): boolean {
    const session =
        typeof sessionDate === 'string' ? new Date(sessionDate) : sessionDate;
    const now = new Date();

    // Trouver le samedi précédent la session
    const sessionDay = session.getDay(); // 0 = dimanche, 6 = samedi
    // Nombre de jours à soustraire pour arriver au samedi précédent
    const daysToPreviousSaturday = ((sessionDay + 1) % 7) + 1; // ex: lundi -> 2, dimanche -> 1

    const cutoff = new Date(session);
    cutoff.setDate(session.getDate() - daysToPreviousSaturday);
    cutoff.setHours(20, 0, 0, 0); // 20h00

    return now > cutoff;
}

/**
 * Get the cutoff datetime for a session
 * Returns the Friday 18:00 before the session
 */
export function getCutoffDateTime(sessionDate: Date | string): Date {
    const session =
        typeof sessionDate === 'string' ? new Date(sessionDate) : sessionDate;

    // Find the Friday before the session
    const sessionDay = session.getDay();
    let daysToFriday =
        sessionDay === 0 ? 2 : sessionDay === 6 ? 1 : sessionDay - 5;
    if (daysToFriday < 0) {
        daysToFriday += 7;
    }

    const cutoffFriday = new Date(session);
    cutoffFriday.setDate(session.getDate() - daysToFriday);
    cutoffFriday.setHours(18, 0, 0, 0);

    return cutoffFriday;
}

/**
 * Validate time range (startTime must be before endTime)
 */
export function validateTimeRange(startTime: string, endTime: string): boolean {
    if (!startTime || !endTime) {
        return true; // Allow empty times (will use defaults)
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return startMinutes < endMinutes;
}

/**
 * Format time string to display format
 */
export function formatTimeDisplay(time: string | null | undefined): string {
    if (!time) {
        return '';
    }
    return time;
}

/**
 * Get display time for a session (uses default if not specified)
 */
export function getSessionDisplayTime(
    slot: SessionSlot,
    startTime?: string | null,
    endTime?: string | null
): { start: string; end: string } {
    const defaults = {
        [SessionSlot.AM]: { start: '09:00', end: '12:00' },
        [SessionSlot.PM]: { start: '14:00', end: '17:00' },
    };

    return {
        start: startTime || defaults[slot].start,
        end: endTime || defaults[slot].end,
    };
}
