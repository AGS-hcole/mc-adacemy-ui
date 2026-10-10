import { canWithdrawFromSession } from './session-withdrawal.helpers';

describe('session withdrawal deadline', () => {
    it('allows the last instant of the previous Paris day', () => {
        expect(
            canWithdrawFromSession(
                '2026-10-12T00:00:00Z',
                Date.parse('2026-10-11T21:59:59.999Z')
            )
        ).toBe(true);
    });
    it('rejects midnight on the session day', () => {
        expect(
            canWithdrawFromSession(
                '2026-10-12T00:00:00Z',
                Date.parse('2026-10-11T22:00:00Z')
            )
        ).toBe(false);
    });
    it('handles winter time and invalid dates', () => {
        expect(
            canWithdrawFromSession(
                '2026-10-26',
                Date.parse('2026-10-25T23:00:00Z')
            )
        ).toBe(false);
        expect(canWithdrawFromSession('invalid')).toBe(false);
    });
});
