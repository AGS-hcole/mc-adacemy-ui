import { DateTime } from 'luxon';

/** Session dates store a business day, rather than an instant to localize. */
export function canWithdrawFromSession(
    date: string | Date,
    now = Date.now()
): boolean {
    const day =
        date instanceof Date
            ? date.toISOString().slice(0, 10)
            : date.slice(0, 10);
    const deadline = DateTime.fromISO(day, {
        zone: 'Europe/Paris',
    }).startOf('day');
    return deadline.isValid && now < deadline.toMillis();
}
