import { CommonModule } from '@angular/common';
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
import { MatChipsModule } from '@angular/material/chips';
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
import { combineLatest, forkJoin, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'session-info',
    templateUrl: './info.component.html',
    encapsulation: ViewEncapsulation.None,
    host: { class: 'block w-full h-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        RouterLink,
        CommonModule,
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
    sites: Site[] = [];
    session: Session | null = null;
    editMode: boolean = false;
    selectedDates: Date[] = [];

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
        private _sessionsService: SessionsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Init the form
        this.initForm();

        // Wait for both session and sites to be loaded before binding

        combineLatest([
            this._sessionsService.session$,
            this._sessionsService.sites$,
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([session, sites]) => {
                this.session = session;
                this.sites = sites;

                if (this.session) {
                    this.editMode = true;
                    this._patchForm(this.session);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    initForm() {
        this.sessionForm = this._formBuilder.group({
            siteId: ['', [Validators.required]],
            date: [''], // No longer required for multi-date in create mode
            slot: ['', [Validators.required]],
            startTime: [''],
            endTime: [''],
            notes: [''],
            isPublished: [false],
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save session
     */
    saveSession(): void {
        // In edit mode, validate date field is required
        if (this.editMode && !this.sessionForm.get('date').value) {
            this.sessionForm.get('date').setErrors({ required: true });
            return;
        }

        // In create mode, validate at least one date is selected
        if (!this.editMode && this.selectedDates.length === 0) {
            // Show error - no dates selected
            return;
        }

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

        if (this.editMode && this.session) {
            // Update existing session
            const startISO = this._combineDateAndTimeISO(
                formValue.date,
                formValue.startTime
            );
            const endISO = this._combineDateAndTimeISO(
                formValue.date,
                formValue.endTime
            );

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
            // Create new sessions - one per selected date
            const createRequests = this.selectedDates.map((date) => {
                const startISO = this._combineDateAndTimeISO(
                    date,
                    formValue.startTime
                );
                const endISO = this._combineDateAndTimeISO(
                    date,
                    formValue.endTime
                );

                const createRequest: CreateSessionRequest = {
                    siteId: formValue.siteId,
                    date: this._formatDate(date),
                    slot: formValue.slot,
                    startTime: startISO,
                    endTime: endISO,
                    notes: formValue.notes || null,
                    isPublished: formValue.isPublished,
                };

                return this._sessionsService.createSession(createRequest);
            });

            // Execute all create requests in parallel
            forkJoin(createRequests).subscribe({
                next: () => {
                    this._router.navigate(['../'], {
                        relativeTo: this._activatedRoute,
                    });
                },
                error: (error) => {
                    console.error('Error creating sessions:', error);
                    // Could add error handling UI here
                },
            });
        }
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    }

    /**
     * Add selected date to the list
     */
    addDate(): void {
        const dateValue = this.sessionForm.get('date').value;
        if (!dateValue) {
            return;
        }

        const newDate =
            dateValue instanceof Date ? dateValue : new Date(dateValue);

        // Check if date already exists
        const dateExists = this.selectedDates.some(
            (d) => this._formatDate(d) === this._formatDate(newDate)
        );

        if (!dateExists) {
            this.selectedDates.push(newDate);
            // Sort dates chronologically
            this.selectedDates.sort((a, b) => a.getTime() - b.getTime());
            this.sessionForm.patchValue({ date: '' });
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Remove a date from the selected dates list
     */
    removeDate(index: number): void {
        this.selectedDates.splice(index, 1);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Format date for display
     */
    formatDateDisplay(date: Date): string {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            startTime: session.startTime
                ? this._extractLocalTime(session.startTime)
                : '',
            endTime: session.endTime
                ? this._extractLocalTime(session.endTime)
                : '',
            notes: session.notes || '',
            isPublished: session.isPublished,
        });
    }

    /**
     * Extracts "HH:mm" in local time from an ISO UTC date string or "HH:mm:ss" string.
     */
    private _extractLocalTime(dateTime: string): string {
        if (!dateTime) return '';
        // If ISO string, parse as UTC and convert to local time
        const date = new Date(dateTime);
        if (!isNaN(date.getTime())) {
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        }
        // If already "HH:mm" or "HH:mm:ss"
        const timeMatch = dateTime.match(/^(\d{2}):(\d{2})/);
        if (timeMatch) {
            return `${timeMatch[1]}:${timeMatch[2]}`;
        }
        return '';
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
