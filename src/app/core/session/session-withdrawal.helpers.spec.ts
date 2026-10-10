import { canWithdrawFromSession } from './session-withdrawal.helpers';

describe('session withdrawal deadline', () => {
    const cases = [
        ['2026-03-29', '2026-03-28T19:00:00.000Z'],
        ['2026-03-30', '2026-03-29T18:00:00.000Z'],
        ['2026-10-25', '2026-10-24T18:00:00.000Z'],
        ['2026-10-26', '2026-10-25T19:00:00.000Z'],
        ['2027-01-01', '2026-12-31T19:00:00.000Z'],
    ];
    for (const [day, cutoff] of cases) {
        it(`allows withdrawal through 20:00 Paris time the day before ${day}`, () => {
            const deadline = Date.parse(cutoff);
            for (const date of [day, `${day}T00:00:00Z`, new Date(day)]) {
                expect(canWithdrawFromSession(date, deadline - 1)).toBe(true);
                expect(canWithdrawFromSession(date, deadline)).toBe(true);
                expect(canWithdrawFromSession(date, deadline + 1)).toBe(false);
                expect(canWithdrawFromSession(date, deadline + 86400000)).toBe(false);
            }
        });
    }
    it('rejects late evening on the previous day', () => {
        expect(
            canWithdrawFromSession(
                '2026-10-12',
                Date.parse('2026-10-11T21:59:59.999Z')
            )
        ).toBe(false);
    });
    it('rejects invalid dates', () => {
        expect(canWithdrawFromSession('invalid')).toBe(false);
    });
});
