import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
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
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { validateTimeRange } from 'app/core/session/session.helpers';
import {
    CreateSessionRequest,
    Session,
    SessionSlot,
    Site,
    UpdateSessionRequest,
} from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { SitesService } from 'app/core/sites/sites.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'session-info',
    templateUrl: './info.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        NgForOf,
        NgIf,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TranslocoModule,
    ],
})
export class SessionInfoComponent implements OnInit, OnDestroy {
    sessionForm: UntypedFormGroup;
    sites$: Observable<Site[]>;
    session: Session | null = null;
    editMode: boolean = false;

    SessionSlot = SessionSlot;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _sessionsService: SessionsService,
        private _sitesService: SitesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get sites from SitesService (automatically loads available sites)
        this.sites$ = this._sitesService.sites$;
        this._sitesService.getSites().subscribe();

        // Create the form
        this.sessionForm = this._formBuilder.group({
            siteId: ['', [Validators.required]],
            date: ['', [Validators.required]],
            slot: ['', [Validators.required]],
            startTime: [''],
            endTime: [''],
            notes: [''],
            isPublished: [false],
        });

        // Get session if editing
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((params) => {
                if (params['id'] && params['id'] !== 'new') {
                    this.editMode = true;
                    this._sessionsService
                        .getSessionById(params['id'])
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((session) => {
                            this.session = session;
                            this._patchForm(session);
                            this._changeDetectorRef.markForCheck();
                        });
                } else {
                    this.editMode = false;
                }
            });

        // Watch slot changes to pre-fill default times
        this.sessionForm
            .get('slot')
            .valueChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((slot: SessionSlot) => {
                if (
                    slot &&
                    !this.sessionForm.get('startTime').value &&
                    !this.sessionForm.get('endTime').value
                ) {
                    if (slot === SessionSlot.AM) {
                        this.sessionForm.patchValue({
                            startTime: '09:00',
                            endTime: '12:00',
                        });
                    } else if (slot === SessionSlot.PM) {
                        this.sessionForm.patchValue({
                            startTime: '14:00',
                            endTime: '17:00',
                        });
                    }
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this._sessionsService.resetSession();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Save session
     */
    saveSession(): void {
        if (this.sessionForm.invalid) {
            return;
        }

        // Validate time range
        const startTime = this.sessionForm.get('startTime').value;
        const endTime = this.sessionForm.get('endTime').value;

        if (startTime && endTime && !validateTimeRange(startTime, endTime)) {
            // Show error
            this.sessionForm.get('endTime').setErrors({ invalidRange: true });
            return;
        }

        const formValue = this.sessionForm.value;

        const startISO = this._combineDateAndTimeISO(
            formValue.date,
            formValue.startTime
        );
        const endISO = this._combineDateAndTimeISO(
            formValue.date,
            formValue.endTime
        );

        if (this.editMode && this.session) {
            // Update existing session
            const updateRequest: UpdateSessionRequest = {
                siteId: formValue.siteId,
                date: this._formatDate(formValue.date), // "YYYY-MM-DD"
                slot: formValue.slot,
                startTime: startISO, // ISO string ou null
                endTime: endISO, // ISO string ou null
                notes: formValue.notes || null,
                isPublished: formValue.isPublished,
            };

            this._sessionsService
                .updateSession(this.session.id, updateRequest)
                .subscribe(() => {
                    this._router.navigate(['../'], {
                        relativeTo: this._activatedRoute,
                    });
                });
        } else {
            // Create new session
            const createRequest: CreateSessionRequest = {
                siteId: formValue.siteId,
                date: this._formatDate(formValue.date),
                slot: formValue.slot,
                startTime: startISO,
                endTime: endISO,
                notes: formValue.notes || null,
                isPublished: formValue.isPublished,
            };

            this._sessionsService.createSession(createRequest).subscribe(() => {
                this._router.navigate(['../'], {
                    relativeTo: this._activatedRoute,
                });
            });
        }
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Patch form with session data
     */
    private _patchForm(session: Session): void {
        this.sessionForm.patchValue({
            siteId: session.siteId,
            date: new Date(session.date),
            slot: session.slot,
            startTime: session.startTime || '',
            endTime: session.endTime || '',
            notes: session.notes || '',
            isPublished: session.isPublished,
        });
    }

    /**
     * Format date to ISO string (YYYY-MM-DD)
     */
    private _formatDate(date: any): string {
        if (!date) return ''; // handle null/undefined

        // Convert to Date if it's not already one
        const d = date instanceof Date ? date : new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    /**
     * Combine a date and "HH:mm" time to an ISO 8601 string (UTC).
     * Returns null if no time is provided.
     */
    private _combineDateAndTimeISO(
        date: any,
        time?: string | null
    ): string | null {
        if (!time) return null;

        const d = date instanceof Date ? date : new Date(date);
        const [hh, mm] = time.split(':').map(Number);

        // Crée un Date en heure locale, puis convertit en ISO (UTC)
        const combined = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            hh ?? 0,
            mm ?? 0,
            0,
            0
        );

        // Si tu veux éviter le décalage lié au fuseau, vois la NOTE plus bas.
        return combined.toISOString();
    }
}
