import { NgClass, NgForOf, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import {
    Session,
    SessionFilters,
    SessionSlot,
    Site,
} from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { DateTime } from 'luxon';
import { Subject, combineLatest, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-sessions-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LocalizedDatePipe,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgIf,
        NgForOf,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class AdminSessionsListComponent implements OnInit, OnDestroy {
    sessions: Session[] = [];
    sites: Site[];

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedSite: string | null = null;
    selectedSlot: SessionSlot | null = null;
    selectedPublished: boolean | null = null;
    selectedStartDate: Date | null = null;
    selectedEndDate: Date | null = null;

    SessionSlot = SessionSlot;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _sessionsService: SessionsService,
        private _matDialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Set default startDate to today
        this.selectedStartDate = DateTime.now().startOf('day').toJSDate();

        combineLatest([
            this._sessionsService.sites$,
            this._sessionsService.sessions$,
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([sites, sessions]) => {
                this.sites = sites;
                this.sessions = sessions;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input
        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe(() => {
                this.loadSessions();
            });

        // Load sessions with default filters
        this.loadSessions();
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
     * Load sessions with filters
     */
    loadSessions(): void {
        const filters: SessionFilters = {
            siteId: this.selectedSite,
            slot: this.selectedSlot,
            isPublished: this.selectedPublished,
            startDate: this.selectedStartDate
                ? DateTime.fromJSDate(this.selectedStartDate).toISODate()
                : null,
            endDate: this.selectedEndDate
                ? DateTime.fromJSDate(this.selectedEndDate).toISODate()
                : null,
        };

        this._sessionsService.getSessions(filters).subscribe();
    }

    /**
     * Filter change handler
     */
    onFilterChange(): void {
        this.loadSessions();
    }

    /**
     * Create new session
     */
    createSession(): void {
        this._router.navigate(['./new'], { relativeTo: this._activatedRoute });
    }

    /**
     * Edit session
     */
    editSession(sessionId: string): void {
        this._router.navigate(['./', sessionId], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Get participants count for a session
     */
    getParticipantsCount(session: Session): number {
        return session.attendances
            ? session.attendances.filter((a) => a.status === 'YES').length
            : 0;
    }

    /**
     * Delete session
     */
    deleteSession(session: Session): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.DELETE_SESSION.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.DELETE_SESSION.MESSAGE'
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.DELETE_SESSION.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sessionsService
                    .deleteSession(session.id)
                    .subscribe(() => {
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Toggle session published status
     */
    togglePublished(session: Session): void {
        this._sessionsService
            .updateSession(session.id, {
                isPublished: !session.isPublished,
            })
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Cancel session
     */
    cancelSession(session: Session): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.CANCEL_SESSION.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.CANCEL_SESSION.MESSAGE'
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.CANCEL_SESSION.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sessionsService
                    .updateSession(session.id, {
                        isCanceled: true,
                    })
                    .subscribe(() => {
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Get display time for session
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
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
