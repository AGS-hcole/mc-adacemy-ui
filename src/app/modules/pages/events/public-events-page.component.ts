import { CommonModule, DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { EventsApi } from 'app/core/api/events.api';
import {
    PaginatedResponse,
    PublicEvent,
} from 'app/core/models/public-event.model';

@Component({
    selector: 'public-events-page',
    templateUrl: './public-events-page.component.html',
    styleUrls: ['./public-events-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        TranslocoModule,
    ],
})
export class PublicEventsPageComponent implements OnInit {
    events = signal<PublicEvent[]>([]);
    loading = signal<boolean>(false);
    currentPage = signal<number>(1);
    total = signal<number>(0);
    pageSize = 12;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _eventsApi: EventsApi,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Get initial data from resolver
        const data = this._activatedRoute.snapshot.data[
            'events'
        ] as PaginatedResponse<PublicEvent>;
        if (data) {
            this.events.set(data.items);
            this.currentPage.set(data.page);
            this.total.set(data.total);
        }
    }

    /**
     * Load more events
     */
    loadMore(): void {
        this.loading.set(true);
        const nextPage = this.currentPage() + 1;

        this._eventsApi
            .list({ page: nextPage, pageSize: this.pageSize, sort: 'order' })
            .subscribe({
                next: (response) => {
                    this.events.set([...this.events(), ...response.items]);
                    this.currentPage.set(response.page);
                    this.loading.set(false);
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading.set(false);
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Check if there are more events to load
     */
    hasMore(): boolean {
        return this.events().length < this.total();
    }

    /**
     * Open external registration URL
     */
    openRegistration(url: string | null | undefined): void {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * Check if event is happening now based on time window
     */
    isHappeningNow(event: PublicEvent): boolean {
        if (!event.isActive || !event.startTime || !event.endTime) {
            return false;
        }
        const now = new Date();
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return now >= start && now <= end;
    }

    /**
     * Format time range for display
     */
    formatTimeRange(event: PublicEvent): string | null {
        if (!event.startTime && !event.endTime) {
            return null;
        }
        const datePipe = new DatePipe('en-US');
        const start = event.startTime
            ? datePipe.transform(event.startTime, 'dd/MM/yyyy HH:mm')
            : '';
        const end = event.endTime
            ? datePipe.transform(event.endTime, 'dd/MM/yyyy HH:mm')
            : '';

        if (start && end) {
            return `${start} - ${end}`;
        }
        return start || end;
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: PublicEvent): string {
        return item.id;
    }
}
