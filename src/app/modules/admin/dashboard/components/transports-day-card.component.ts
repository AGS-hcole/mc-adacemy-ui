import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { TransportBookingStatus } from 'app/core/transports/transport.types';
import {
    DashboardBookingDto,
    DashboardTransportOccurrenceDto,
} from '../models/admin-dashboard.models';

@Component({
    selector: 'transports-day-card',
    templateUrl: './transports-day-card.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TransportsDayCardComponent {
    @Input() transports: DashboardTransportOccurrenceDto[] = [];
    @Input() loading = false;

    readonly TransportBookingStatus = TransportBookingStatus;

    /**
     * Get confirmed bookings for an occurrence
     */
    getConfirmedBookings(
        occurrence: DashboardTransportOccurrenceDto
    ): DashboardBookingDto[] {
        return occurrence.bookings.filter(
            (b) => b.status === TransportBookingStatus.CONFIRMED
        );
    }

    /**
     * Get total booked seats (sum of confirmed bookings)
     */
    getTotalBookedSeats(occurrence: DashboardTransportOccurrenceDto): number {
        return this.getConfirmedBookings(occurrence).reduce(
            (sum, booking) => sum + booking.seats,
            0
        );
    }

    /**
     * Track by occurrence ID
     */
    trackByOccurrenceId(
        index: number,
        occurrence: DashboardTransportOccurrenceDto
    ): string {
        return occurrence.id;
    }

    /**
     * Track by booking ID
     */
    trackByBookingId(index: number, booking: DashboardBookingDto): string {
        return booking.id;
    }
}
