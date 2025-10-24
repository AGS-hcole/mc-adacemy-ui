import { CommonModule, DatePipe } from '@angular/common';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { EventsApi } from 'app/core/api/events.api';
import {
    PaginatedResponse,
    PublicEvent,
} from 'app/core/models/public-event.model';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-events-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatChipsModule,
        MatTooltipModule,
        TranslocoModule,
        DatePipe,
    ],
})
export class AdminEventsListComponent implements OnInit, OnDestroy {
    events: PublicEvent[] = [];
    displayedColumns: string[] = [
        'name',
        'isPublished',
        'isActive',
        'startTime',
        'endTime',
        'orderIndex',
        'updatedAt',
        'actions',
    ];

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _eventsApi: EventsApi,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService,
        private _matDialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        // Get events from resolver
        const data = this._activatedRoute.snapshot.data[
            'events'
        ] as PaginatedResponse<PublicEvent>;
        if (data) {
            this.events = data.items;
            this._changeDetectorRef.markForCheck();
        }

        // Subscribe to search input
        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe((search) => {
                this.searchEvents(search);
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Search events
     */
    searchEvents(search: string): void {
        this._eventsApi
            .listAdmin({ page: 1, pageSize: 20, search, sort: 'order' })
            .subscribe({
                next: (response) => {
                    this.events = response.items;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error searching events:', error);
                },
            });
    }

    /**
     * Create new event
     */
    createEvent(): void {
        this._router.navigate(['new'], { relativeTo: this._activatedRoute });
    }

    /**
     * Edit event
     */
    editEvent(event: PublicEvent): void {
        this._router.navigate([event.id], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Delete event
     */
    deleteEvent(event: PublicEvent): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('DIALOGS.DELETE_EVENT.TITLE'),
            message: this._translocoService.translate(
                'DIALOGS.DELETE_EVENT.MESSAGE',
                { name: event.name }
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.DELETE_EVENT.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._eventsApi.delete(event.id).subscribe({
                    next: () => {
                        // Remove from local list
                        this.events = this.events.filter(
                            (e) => e.id !== event.id
                        );
                        this._changeDetectorRef.markForCheck();
                        this._snackBar.open(
                            this._translocoService.translate(
                                'EVENTS.ADMIN.DELETE_SUCCESS'
                            ),
                            'OK',
                            { duration: 3000 }
                        );
                    },
                    error: (error) => {
                        console.error('Error deleting event:', error);
                        this._snackBar.open(
                            this._translocoService.translate(
                                'EVENTS.ADMIN.DELETE_ERROR'
                            ),
                            'OK',
                            { duration: 3000 }
                        );
                    },
                });
            }
        });
    }

    /**
     * Open public page
     */
    openPublicPage(): void {
        window.open('/events', '_blank', 'noopener,noreferrer');
    }

    /**
     * Copy public URL
     */
    copyPublicUrl(): void {
        const url = `${window.location.origin}/events`;
        navigator.clipboard.writeText(url).then(() => {
            this._snackBar.open(
                this._translocoService.translate('EVENTS.ADMIN.URL_COPIED'),
                'OK',
                { duration: 2000 }
            );
        });
    }

    /**
     * Track by function
     */
    trackByFn(index: number, item: PublicEvent): string {
        return item.id;
    }
}
