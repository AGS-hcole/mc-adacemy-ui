import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import {
    Session,
    SessionFilters,
    SessionSlot,
    Site,
} from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { Observable, Subject, debounceTime, map, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-sessions-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        DatePipe,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
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
    sessions$: Observable<Session[]>;
    sites$: Observable<Site[]>;
    
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedSite: string | null = null;
    selectedSlot: SessionSlot | null = null;
    selectedPublished: boolean | null = null;
    
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
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get sessions
        this.sessions$ = this._sessionsService.sessions$;
        
        // Get sites
        this.sites$ = this._sessionsService.sites$;
        
        // Load initial data
        this._sessionsService.getSites().subscribe();
        this.loadSessions();

        // Subscribe to search input
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300)
            )
            .subscribe(() => {
                this.loadSessions();
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
     * Load sessions with filters
     */
    loadSessions(): void {
        const filters: SessionFilters = {
            siteId: this.selectedSite,
            slot: this.selectedSlot,
            isPublished: this.selectedPublished,
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
     * Delete session
     */
    deleteSession(session: Session): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete session',
            message: 'Are you sure you want to delete this session?',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sessionsService.deleteSession(session.id).subscribe(() => {
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
            title: 'Cancel session',
            message: 'Are you sure you want to cancel this session?',
            actions: {
                confirm: {
                    label: 'Cancel Session',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sessionsService
                    .updateSession(session.id, {
                        isCancelled: true,
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
        const start = session.startTime || (session.slot === SessionSlot.AM ? '09:00' : '14:00');
        const end = session.endTime || (session.slot === SessionSlot.AM ? '12:00' : '17:00');
        return `${start} - ${end}`;
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
