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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import {
    TransportOccurrence,
    TransportOccurrenceStatus,
} from 'app/core/transports/transport.types';
import { TransportsService } from 'app/core/transports/transports.service';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user-transports-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgIf,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        TranslocoModule,
        LocalizedDatePipe,
    ],
})
export class UserTransportsListComponent implements OnInit, OnDestroy {
    occurrences: TransportOccurrence[] = [];
    loading: boolean = false;

    // Date range filters (default: today -> +14 days)
    fromDate: Date = DateTime.now().startOf('day').toJSDate();
    toDate: Date = DateTime.now().plus({ days: 14 }).startOf('day').toJSDate();

    TransportOccurrenceStatus = TransportOccurrenceStatus;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _transportsService: TransportsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loadOccurrences();
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
     * Load occurrences
     */
    loadOccurrences(): void {
        this.loading = true;
        this._changeDetectorRef.markForCheck();

        const from = DateTime.fromJSDate(this.fromDate).toISODate();
        const to = DateTime.fromJSDate(this.toDate).toISODate();

        this._transportsService
            .getOccurrences({
                from,
                to,
                status: TransportOccurrenceStatus.SCHEDULED,
            })
            .subscribe({
                next: (occurrences) => {
                    this.occurrences = occurrences;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Apply filter
     */
    applyFilter(): void {
        this.loadOccurrences();
    }

    /**
     * Reset filter to default
     */
    resetFilter(): void {
        this.fromDate = DateTime.now().startOf('day').toJSDate();
        this.toDate = DateTime.now().plus({ days: 14 }).startOf('day').toJSDate();
        this.applyFilter();
    }

    /**
     * Book an occurrence
     */
    bookOccurrence(occurrence: TransportOccurrence): void {
        if (this.isBookingClosed(occurrence)) {
            return;
        }

        this._transportsService
            .bookOccurrence(occurrence.id, { seats: 1 })
            .subscribe(() => {
                this.loadOccurrences();
            });
    }

    /**
     * Cancel user's booking
     */
    cancelBooking(occurrence: TransportOccurrence): void {
        if (!occurrence.myBooking) {
            return;
        }

        this._transportsService
            .cancelBooking(occurrence.myBooking.id)
            .subscribe(() => {
                this.loadOccurrences();
            });
    }

    /**
     * Check if booking is closed (cutoff logic)
     * Booking closes at start of day (00:00) in Europe/Paris timezone
     * Note: Timezone is hardcoded as per business requirement for France-based operations
     */
    isBookingClosed(occurrence: TransportOccurrence): boolean {
        const now = DateTime.now().setZone('Europe/Paris');
        const occurrenceDt = DateTime.fromISO(occurrence.departureAt as string).setZone('Europe/Paris');
        const startOfDay = occurrenceDt.startOf('day');
        
        return now >= startOfDay;
    }

    /**
     * Check if occurrence is fully booked
     */
    isFullyBooked(occurrence: TransportOccurrence): boolean {
        if (occurrence.allowOverbookSnapshot) {
            return false; // Overbooking allowed, never fully booked
        }
        return occurrence.bookedSeats >= occurrence.capacitySnapshot;
    }

    /**
     * Check if user already has a booking
     */
    hasBooking(occurrence: TransportOccurrence): boolean {
        return !!occurrence.myBooking && occurrence.myBooking.status === 'CONFIRMED';
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
