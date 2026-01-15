import { NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import {
    TransportBooking,
    TransportOccurrence,
    TransportOccurrenceStatus,
    TransportTemplate,
} from 'app/core/transports/transport.types';
import { TransportsService } from 'app/core/transports/transports.service';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';
import { AdminTransportTemplateComponent } from '../view/view.component';

@Component({
    selector: 'admin-transport-template-participants',
    templateUrl: './participants.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        TranslocoModule,
        LocalizedDatePipe,
    ],
})
export class AdminTransportTemplateParticipantsComponent
    implements OnInit, OnDestroy
{
    template: TransportTemplate;
    occurrences: TransportOccurrence[] = [];
    selectedOccurrence: TransportOccurrence | null = null;
    selectedOccurrenceId: string | null = null;

    // Date range filters (default: today -> +30 days)
    fromDate: Date = DateTime.now().startOf('day').toJSDate();
    toDate: Date = DateTime.now().plus({ days: 30 }).startOf('day').toJSDate();

    TransportOccurrenceStatus = TransportOccurrenceStatus;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _transportsService: TransportsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog,
        private _translocoService: TranslocoService,
        public _transportTemplateViewComponent: AdminTransportTemplateComponent
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the template
        this._transportsService.template$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((template) => {
                this.template = template;
                if (this.template) {
                    this.loadOccurrences();
                }
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
     * Load occurrences for the template
     */
    loadOccurrences(): void {
        if (!this.template) return;

        const from = DateTime.fromJSDate(this.fromDate).toISODate();
        const to = DateTime.fromJSDate(this.toDate).toISODate();

        this._transportsService
            .getOccurrences({
                templateId: this.template.id,
                from,
                to,
            })
            .subscribe((occurrences) => {
                this.occurrences = occurrences;
                // If an occurrence was selected, update it
                if (this.selectedOccurrenceId) {
                    this.selectedOccurrence =
                        occurrences.find(
                            (o) => o.id === this.selectedOccurrenceId
                        ) || null;
                }
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Apply date range filter
     */
    applyFilter(): void {
        this.selectedOccurrence = null;
        this.selectedOccurrenceId = null;
        this.loadOccurrences();
    }

    /**
     * Reset filters to default
     */
    resetFilter(): void {
        this.fromDate = DateTime.now().startOf('day').toJSDate();
        this.toDate = DateTime.now().plus({ days: 30 }).startOf('day').toJSDate();
        this.applyFilter();
    }

    /**
     * Occurrence selection changed
     */
    onOccurrenceSelected(): void {
        this.selectedOccurrence =
            this.occurrences.find((o) => o.id === this.selectedOccurrenceId) ||
            null;

        // Fetch full details with bookings if needed
        if (this.selectedOccurrence) {
            this._transportsService
                .getOccurrenceById(this.selectedOccurrence.id)
                .subscribe((occurrence) => {
                    this.selectedOccurrence = occurrence;
                    this._changeDetectorRef.markForCheck();
                });
        }

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Cancel a booking (admin)
     */
    cancelBooking(booking: TransportBooking): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.CANCEL_BOOKING.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.CANCEL_BOOKING.MESSAGE'
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.CANCEL_BOOKING.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._transportsService
                    .cancelBooking(booking.id)
                    .subscribe(() => {
                        // Reload occurrence details
                        if (this.selectedOccurrence) {
                            this.onOccurrenceSelected();
                        }
                    });
            }
        });
    }

    /**
     * Cancel occurrence (admin)
     */
    cancelOccurrence(): void {
        if (!this.selectedOccurrence) return;

        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.CANCEL_OCCURRENCE.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.CANCEL_OCCURRENCE.MESSAGE'
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.CANCEL_OCCURRENCE.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._transportsService
                    .cancelOccurrence(this.selectedOccurrence.id, {})
                    .subscribe(() => {
                        this.loadOccurrences();
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Get display name for participant
     */
    getParticipantName(booking: TransportBooking): string {
        if (booking.user?.fullName) {
            return booking.user.fullName;
        }
        if (booking.user?.firstname && booking.user?.lastname) {
            return `${booking.user.firstname} ${booking.user.lastname}`;
        }
        if (booking.userId) {
            // Fallback when user details are not populated
            return `User ID: ${booking.userId.substring(0, 8)}...`;
        }
        return 'Unknown User';
    }

    /**
     * Get display email for participant
     */
    getParticipantEmail(booking: TransportBooking): string {
        if (booking.user?.email) {
            return booking.user.email;
        }
        return '-';
    }

    /**
     * Get occurrence display label
     */
    getOccurrenceLabel(occurrence: TransportOccurrence): string {
        const dt = DateTime.fromISO(occurrence.departureAt as string);
        const formattedDate = dt.toFormat('EEE dd MMM • HH:mm');
        const participants = occurrence.bookedSeats || 0;
        const capacity = occurrence.capacitySnapshot || 0;
        return `${formattedDate} (${participants}/${capacity})`;
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
