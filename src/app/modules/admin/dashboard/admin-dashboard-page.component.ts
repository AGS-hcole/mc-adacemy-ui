import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { RatingsService } from 'app/core/session/ratings.service';
import {
    RatingCommentDialogComponent,
    RatingCommentDialogData,
} from 'app/shared/components/rating-comment-dialog/rating-comment-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { DashboardDateToolbarComponent } from './components/dashboard-date-toolbar.component';
import { ManorsDayCardComponent } from './components/manors-day-card.component';
import { SessionsDayCardComponent } from './components/sessions-day-card.component';
import { TransportsDayCardComponent } from './components/transports-day-card.component';
import {
    AdminDashboardDto,
    DashboardParticipantDto,
} from './models/admin-dashboard.models';
import { AdminDashboardService } from './services/admin-dashboard.service';

@Component({
    selector: 'admin-dashboard-page',
    templateUrl: './admin-dashboard-page.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        TranslocoModule,
        DashboardDateToolbarComponent,
        SessionsDayCardComponent,
        ManorsDayCardComponent,
        TransportsDayCardComponent,
    ],
})
export class AdminDashboardPageComponent implements OnInit, OnDestroy {
    selectedDate: Date = new Date();
    dashboardData: AdminDashboardDto | null = null;
    loading = false;
    error: string | null = null;
    pendingRatings = new Set<string>();

    private _unsubscribeAll = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private _dashboardService: AdminDashboardService,
        private _ratingsService: RatingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _translocoService: TranslocoService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to loading state
        this._dashboardService.loading$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((loading) => {
                this.loading = loading;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to error state
        this._dashboardService.error$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((error) => {
                this.error = error;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to data
        this._dashboardService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                console.log(data);
                this.dashboardData = data;
                this._changeDetectorRef.markForCheck();
            });

        // Load initial data
        this.loadDashboard();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load dashboard data for selected date
     */
    loadDashboard(): void {
        const dateString = this.formatDateToYYYYMMDD(this.selectedDate);
        this._dashboardService.getDashboard(dateString).subscribe({
            error: (error) => {
                console.error('Failed to load dashboard:', error);
            },
        });
    }

    /**
     * Handle date change
     */
    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadDashboard();
    }

    /**
     * Retry loading on error
     */
    retry(): void {
        this.loadDashboard();
    }

    /**
     * Handle rating change from star rating
     */
    onRatingChange(event: {
        sessionId: string;
        participant: DashboardParticipantDto;
        score: number;
    }): void {
        const { sessionId, participant, score } = event;
        const currentComment = participant.rating?.comment || '';
        this.saveRating(sessionId, participant, score, currentComment);
    }

    /**
     * Handle comment dialog request
     */
    onOpenCommentDialog(event: {
        sessionId: string;
        participant: DashboardParticipantDto;
    }): void {
        const { sessionId, participant } = event;
        const participantName = `${participant.firstname} ${participant.lastname}`;
        const currentRating = participant.rating;

        const dialogRef = this._dialog.open<
            RatingCommentDialogComponent,
            RatingCommentDialogData,
            string
        >(RatingCommentDialogComponent, {
            width: '600px',
            data: {
                participantName,
                comment: currentRating?.comment || '',
            },
        });

        dialogRef.afterClosed().subscribe((comment) => {
            if (comment !== undefined) {
                // Keep the current score, only update comment
                const score = currentRating?.score ?? 0;
                this.saveRating(sessionId, participant, score, comment);
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Save rating and comment
     */
    private saveRating(
        sessionId: string,
        participant: DashboardParticipantDto,
        score: number,
        comment: string
    ): void {
        // Optimistic update
        const optimisticData = this.optimisticallyUpdateRating(
            sessionId,
            participant.userId,
            score,
            comment
        );

        this.pendingRatings.add(participant.userId);
        this._changeDetectorRef.markForCheck();

        this._ratingsService
            .upsert(sessionId, participant.userId, { score, comment })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (rating) => {
                    // Update with actual rating from server
                    this.updateRatingInCache(
                        sessionId,
                        participant.userId,
                        rating.score,
                        rating.comment || null
                    );

                    this.pendingRatings.delete(participant.userId);
                    this._changeDetectorRef.markForCheck();

                    this._snackBar.open(
                        this._translocoService.translate(
                            'DASHBOARD.RATING_SAVED'
                        ) || 'Rating saved successfully',
                        '',
                        { duration: 3000 }
                    );
                },
                error: (error) => {
                    console.error('Failed to save rating:', error);
                    this.pendingRatings.delete(participant.userId);
                    // Rollback optimistic update
                    if (optimisticData) {
                        this.dashboardData = optimisticData.original;
                        const dateString = this.formatDateToYYYYMMDD(
                            this.selectedDate
                        );
                        this._dashboardService.updateCache(
                            dateString,
                            optimisticData.original
                        );
                    }

                    this._snackBar.open(
                        this._translocoService.translate(
                            'DASHBOARD.RATING_ERROR'
                        ) || 'Failed to save rating',
                        '',
                        { duration: 3000 }
                    );
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Optimistically update rating in local data
     */
    private optimisticallyUpdateRating(
        sessionId: string,
        userId: string,
        score: number,
        comment: string
    ): { original: AdminDashboardDto; updated: AdminDashboardDto } | null {
        if (!this.dashboardData) {
            return null;
        }

        // Simple shallow clone for rollback (only used if API call fails)
        const original = { ...this.dashboardData };
        // Create updated version by modifying current data
        const updated = this.dashboardData;

        // Find and update the participant
        const session = updated.sessions.find((s) => s.id === sessionId);
        if (session) {
            const participant = session.participants.find(
                (p) => p.userId === userId
            );
            if (participant) {
                if (participant.rating) {
                    participant.rating.score = score;
                    participant.rating.comment = comment || null;
                } else {
                    participant.rating = {
                        id: `temp-${Date.now()}-${userId}`,
                        score,
                        comment: comment || null,
                    };
                }
            }
        }

        const dateString = this.formatDateToYYYYMMDD(this.selectedDate);
        this._dashboardService.updateCache(dateString, updated);
        this._changeDetectorRef.markForCheck();

        return { original, updated };
    }

    /**
     * Update rating in cache with server data
     */
    private updateRatingInCache(
        sessionId: string,
        userId: string,
        score: number,
        comment: string | null
    ): void {
        if (!this.dashboardData) {
            return;
        }

        const session = this.dashboardData.sessions.find(
            (s) => s.id === sessionId
        );
        if (session) {
            const participant = session.participants.find(
                (p) => p.userId === userId
            );
            if (participant && participant.rating) {
                participant.rating.score = score;
                participant.rating.comment = comment;
            }
        }

        const dateString = this.formatDateToYYYYMMDD(this.selectedDate);
        this._dashboardService.updateCache(dateString, this.dashboardData);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Format date to YYYY-MM-DD
     */
    private formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
