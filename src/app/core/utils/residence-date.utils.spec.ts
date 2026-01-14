import { DateTime, Settings } from 'luxon';
import {
    isAfterCutoffForDate,
    nowParis,
    startOfWeekRange,
    toYmd,
} from './residence-date.utils';

describe('residence-date.utils', () => {
    describe('nowParis', () => {
        it('should return current time in Paris timezone', () => {
            const result = nowParis();
            expect(result).toBeDefined();
            expect(result.zone.name).toBe('Europe/Paris');
        });
    });

    describe('toYmd', () => {
        it('should convert DateTime to YYYY-MM-DD format', () => {
            const date = DateTime.fromISO('2025-01-15T10:30:00', {
                zone: 'Europe/Paris',
            });
            const result = toYmd(date);
            expect(result).toBe('2025-01-15');
        });
    });

    describe('isAfterCutoffForDate', () => {
        beforeEach(() => {
            // Mock current time to a fixed point for testing
            Settings.now = () => new Date('2025-01-15T14:00:00Z').valueOf();
        });

        afterEach(() => {
            // Reset to actual time
            Settings.now = () => Date.now();
        });

        it('should return true when current time is after 12:00 Paris time for the same day', () => {
            // Mock time: 2025-01-15 14:00 UTC = 2025-01-15 15:00 Paris (after cutoff)
            const result = isAfterCutoffForDate('2025-01-15');
            expect(result).toBe(true);
        });

        it('should return false when current time is before 12:00 Paris time for the same day', () => {
            // Mock time to be before cutoff
            Settings.now = () => new Date('2025-01-15T09:00:00Z').valueOf();
            // 2025-01-15 09:00 UTC = 2025-01-15 10:00 Paris (before cutoff)
            const result = isAfterCutoffForDate('2025-01-15');
            expect(result).toBe(false);
        });

        it('should return false for future dates', () => {
            // Current: 2025-01-15 14:00 UTC = 15:00 Paris
            // Target: 2025-01-16 (cutoff is 2025-01-16 12:00 Paris)
            const result = isAfterCutoffForDate('2025-01-16');
            expect(result).toBe(false);
        });

        it('should return true for past dates', () => {
            // Current: 2025-01-15 14:00 UTC = 15:00 Paris
            // Target: 2025-01-14 (cutoff was 2025-01-14 12:00 Paris)
            const result = isAfterCutoffForDate('2025-01-14');
            expect(result).toBe(true);
        });

        it('should handle invalid date format', () => {
            const result = isAfterCutoffForDate('invalid-date');
            expect(result).toBe(false);
        });

        it('should return false when current time is exactly at cutoff', () => {
            // Mock to exactly 12:00 Paris time (11:00 UTC in winter, 10:00 UTC in summer)
            Settings.now = () => new Date('2025-01-15T11:00:00Z').valueOf();
            const result = isAfterCutoffForDate('2025-01-15');
            expect(result).toBe(false); // >= cutoff but we're checking for strict >
        });
    });

    describe('startOfWeekRange', () => {
        it('should return start of current day in Paris timezone', () => {
            const result = startOfWeekRange();
            expect(result).toBeDefined();
            expect(result.zone.name).toBe('Europe/Paris');
            expect(result.hour).toBe(0);
            expect(result.minute).toBe(0);
            expect(result.second).toBe(0);
        });
    });
});
