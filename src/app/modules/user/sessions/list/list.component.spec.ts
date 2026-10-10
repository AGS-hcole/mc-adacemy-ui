import { Subject } from 'rxjs';
import { UserSessionsListComponent } from './list.component';

describe('User session withdrawal', () => {
    let component: UserSessionsListComponent;
    let closed: Subject<string>;
    let response: Subject<any>;
    let confirmation: any;
    let rsvp: any;
    let session: any;

    beforeEach(() => {
        closed = new Subject();
        response = new Subject();
        confirmation = {
            open: jasmine.createSpy('open').and.returnValue({
                afterClosed: () => closed,
            }),
        };
        rsvp = { withdraw: jasmine.createSpy('withdraw').and.returnValue(response) };
        component = new UserSessionsListComponent(
            { markForCheck: jasmine.createSpy('markForCheck') } as any,
            null, null, rsvp, null,
            { translate: (key: string) => key } as any,
            confirmation
        );
        component.user = { id: 'user' } as any;
        session = {
            id: 'session', date: '2099-01-01',
            attendances: [{ userId: 'user', status: 'YES' }],
        };
        component.sessions = [session];
    });

    function confirm(): void {
        closed.next('confirmed');
        closed.complete();
    }

    afterEach(() => component.ngOnDestroy());

    it('opens Fuse once and only sends withdrawal after confirmation', () => {
        component.withdrawFromSession(session);
        component.withdrawFromSession(session);
        expect(confirmation.open).toHaveBeenCalledTimes(1);
        expect(rsvp.withdraw).not.toHaveBeenCalled();
        confirm();
        expect(rsvp.withdraw).toHaveBeenCalledOnceWith('session');
        expect(component.pendingSessionIds.has('session')).toBeTrue();
        const updated = { ...session, attendances: [{ userId: 'user', status: 'NO' }] };
        response.next(updated);
        response.complete();
        expect(component.sessions).toEqual([updated]);
        expect(component.isRegistered(updated, component.user)).toBeFalse();
        expect(component.pendingSessionIds.size).toBe(0);
    });

    for (const result of ['cancelled', undefined]) {
        it(`does not withdraw on dismissal (${result}) and permits retry`, () => {
            component.withdrawFromSession(session);
            closed.next(result);
            closed.complete();
            expect(rsvp.withdraw).not.toHaveBeenCalled();
            expect(component.pendingSessionIds.size).toBe(0);
            component.withdrawFromSession(session);
            expect(confirmation.open).toHaveBeenCalledTimes(2);
        });
    }

    for (const status of [403, 500]) {
        it(`shows an error for HTTP ${status} and releases the button`, () => {
            component.withdrawFromSession(session);
            confirm();
            response.error({ status });
            expect(component.withdrawalErrors.session).toBe(
                status === 403 ? 'SESSIONS.USER.WITHDRAW.CLOSED' : 'SESSIONS.USER.WITHDRAW.ERROR'
            );
            expect(component.pendingSessionIds.size).toBe(0);
            expect(component.isRegistered(session, component.user)).toBeTrue();
        });
    }

    it('does not open a dialog after the deadline', () => {
        session.date = '2000-01-01';
        component.withdrawFromSession(session);
        expect(confirmation.open).not.toHaveBeenCalled();
    });

    it('rechecks the deadline when confirming', () => {
        component.withdrawFromSession(session);
        session.date = '2000-01-01';
        confirm();
        expect(rsvp.withdraw).not.toHaveBeenCalled();
        expect(component.withdrawalErrors.session).toBe('SESSIONS.USER.WITHDRAW.CLOSED');
        expect(component.pendingSessionIds.size).toBe(0);
    });

    it('unsubscribes from the dialog when leaving the page', () => {
        component.withdrawFromSession(session);
        component.ngOnDestroy();
        confirm();
        expect(rsvp.withdraw).not.toHaveBeenCalled();
        expect(component.pendingSessionIds.size).toBe(0);
    });
});
