import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { RsvpService } from 'app/core/session/rsvp.service';
import {
    isCutoffPassed,
    isFormulaCompatibleWithSlot,
} from 'app/core/session/session.helpers';
import { Session, SessionSlot } from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user-sessions-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LocalizedDatePipe,
        NgClass,
        MatButtonModule,
        MatIconModule,
        CommonModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class UserSessionsListComponent implements OnInit, OnDestroy {
    sessions: Session[] = [];
    user: User;

    SessionSlot = SessionSlot;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _sessionsService: SessionsService,
        private _rsvpService: RsvpService,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        combineLatest([
            this._userService.user$,
            this._sessionsService.getUpcomingSessions(),
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([user, sessions]) => {
                this.user = user;
                this.sessions = sessions.slice().sort((a, b) => {
                    const ta = a?.date ? new Date(a.date).getTime() : 0;
                    const tb = b?.date ? new Date(b.date).getTime() : 0;
                    return ta - tb;
                });
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register for a session
     */
    registerForSession(session: Session, user: User): void {
        // Check cutoff
        if (isCutoffPassed(session.date)) {
            // Show error - cutoff passed
            return;
        }

        // Check formula compatibility
        if (!isFormulaCompatibleWithSlot(user.formula, session.slot)) {
            // Show warning - out of contract
            // Could still allow with confirmation
        }

        this._rsvpService
            .rsvp(session.id, { status: 'YES', comment: '' })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._sessionsService
                    .getUpcomingSessions()
                    .subscribe((sessions) => {
                        this.sessions = sessions;
                        this._changeDetectorRef.markForCheck();
                    });
            });
    }

    /**
     * Check if user can register for a session
     */
    canRegister(session: Session, user: User): boolean {
        // Check basic eligibility
        const { canRegister } = this._rsvpService.canRegister(
            session,
            user.formula
        );
        if (!canRegister) {
            return false;
        }

        // Check cutoff
        if (isCutoffPassed(session.date)) {
            return false;
        }

        // Check if already registered
        if (this.isRegistered(session, user)) {
            return false;
        }

        return true;
    }

    /**
     * Check if user is registered for a session
     */
    isRegistered(session: Session, user: User): boolean {
        if (!session.attendances) {
            return false;
        }
        return session.attendances.some(
            (attendee) =>
                attendee.userId === user.id && attendee.status === 'YES'
        );
    }

    /**
     * Get registration status message
     */
    getStatusMessage(session: Session, user: User): string {
        if (this.isRegistered(session, user)) {
            return 'SESSIONS.USER.STATUS.REGISTERED';
        }

        if (session.isCanceled) {
            return 'SESSIONS.USER.STATUS.CANCELLED';
        }

        if (isCutoffPassed(session.date)) {
            return 'SESSIONS.USER.STATUS.CUTOFF_PASSED';
        }

        const { canRegister, reason } = this._rsvpService.canRegister(
            session,
            user.formula
        );
        if (!canRegister) {
            switch (reason) {
                case 'SESSION_FULL':
                    return 'SESSIONS.USER.STATUS.FULL';
                case 'SESSION_NOT_PUBLISHED':
                    return 'SESSIONS.USER.STATUS.NOT_PUBLISHED';
                default:
                    return 'SESSIONS.USER.STATUS.UNAVAILABLE';
            }
        }

        if (!isFormulaCompatibleWithSlot(user.formula, session.slot)) {
            return 'SESSIONS.USER.STATUS.OUT_OF_CONTRACT';
        }

        return 'SESSIONS.USER.STATUS.AVAILABLE';
    }

    /**
     * Get display time for a session
     */
    getDisplayTime(session: Session): string {
        // Helper to parse ISO date string and return local time string in HH:mm
        const toLocalTime = (
            isoString: string | undefined,
            fallback: string
        ): string => {
            if (!isoString) return fallback;
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return fallback;
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        const defaultStart =
            session.slot === SessionSlot.AM ? '09:00' : '14:00';
        const defaultEnd = session.slot === SessionSlot.AM ? '12:00' : '17:00';

        const start = toLocalTime(session.startTime, defaultStart);
        const end = toLocalTime(session.endTime, defaultEnd);

        return `${start} - ${end}`;
    }

    /**
     * Group sessions by date
     */
    groupSessionsByDate(sessions: Session[]): Map<string, Session[]> {
        const grouped = new Map<string, Session[]>();

        sessions.forEach((session) => {
            const dateKey = new Date(session.date).toDateString();
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey).push(session);
        });

        return grouped;
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
