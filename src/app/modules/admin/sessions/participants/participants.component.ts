import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { RatingsService } from 'app/core/session/ratings.service';
import {
    Rating,
    Session,
    SessionAttendee,
    SessionRatingsResponse,
} from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { User } from 'app/core/user/user.types';
import { UsersService } from 'app/modules/admin/users/users.service';
import {
    RatingCommentDialogComponent,
    RatingCommentDialogData,
} from 'app/shared/components/rating-comment-dialog/rating-comment-dialog.component';
import { StarRatingComponent } from 'app/shared/components/star-rating/star-rating.component';
import {
    Observable,
    Subject,
    debounceTime,
    distinctUntilChanged,
    takeUntil,
} from 'rxjs';

@Component({
    selector: 'session-participants',
    templateUrl: './participants.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        NgIf,
        NgForOf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        StarRatingComponent,
    ],
})
export class SessionParticipantsComponent implements OnInit, OnDestroy {
    session: Session;
    users$: Observable<User[]>;
    selectedUserId: string | null = null;
    ratingsResponse: SessionRatingsResponse | null = null;
    ratingsMap: Map<string, Rating> = new Map();
    pendingRatings: Set<string> = new Set();
    ratingChanges$ = new Subject<{ userId: string; score: number }>();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _sessionsService: SessionsService,
        private _usersService: UsersService,
        private _ratingsService: RatingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the session
        this._sessionsService.session$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((session: Session) => {
                this.session = session;
                // Load ratings when session is available
                if (session?.id) {
                    this.loadRatings();
                }
                this._changeDetectorRef.markForCheck();
            });

        // Get users
        this.users$ = this._usersService.users$;

        // Load users
        this._usersService.getUsers().subscribe();

        // Setup debounced rating updates
        this.ratingChanges$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(
                    (prev, curr) =>
                        prev.userId === curr.userId &&
                        prev.score === curr.score
                ),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(({ userId, score }) => {
                this.saveRating(userId, score);
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
     * Add participant
     */
    addParticipant(): void {
        if (!this.selectedUserId) {
            return;
        }

        this._sessionsService
            .adminRsvp(this.session.id, {
                status: 'YES',
                userId: this.selectedUserId,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedSession) => {
                this.session = updatedSession;
                this.selectedUserId = null;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Remove participant
     */
    removeParticipant(attendanceId: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Retirer le participant',
            message: 'Êtes-vous sûr de vouloir retirer ce participant ?',
            actions: {
                confirm: {
                    label: 'Retirer',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sessionsService
                    .adminRsvp(this.session.id, {
                        status: 'NO',
                        userId: attendanceId,
                    })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((updatedSession) => {
                        this.session = updatedSession;
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Check if user is already registered
     */
    isUserRegistered(userId: string): boolean {
        if (!this.session?.attendances) {
            return false;
        }
        return this.session.attendances.some(
            (attendance) =>
                attendance.userId === userId && attendance.status === 'YES'
        );
    }

    /**
     * Get available users (not yet registered)
     */
    getAvailableUsers(users: User[]): User[] {
        if (!users) {
            return [];
        }
        return users.filter((user) => !this.isUserRegistered(user.id));
    }

    /**
     * Get track by function for ngFor
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Ratings methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load ratings for the session
     */
    loadRatings(): void {
        if (!this.session?.id) {
            return;
        }

        this._ratingsService
            .getForSession(this.session.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.ratingsResponse = response;
                    this.ratingsMap.clear();
                    response.ratings.forEach((rating) => {
                        this.ratingsMap.set(rating.userId, rating);
                    });
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Failed to load ratings:', error);
                },
            });
    }

    /**
     * Get rating for a participant
     */
    getRating(userId: string): number {
        return this.ratingsMap.get(userId)?.score || 0;
    }

    /**
     * Check if a rating is pending save
     */
    isRatingPending(userId: string): boolean {
        return this.pendingRatings.has(userId);
    }

    /**
     * Handle rating change (optimistic update with debounce)
     */
    onRatingChange(userId: string, score: number): void {
        // Optimistic update
        const existingRating = this.ratingsMap.get(userId);
        if (existingRating) {
            existingRating.score = score;
        } else {
            this.ratingsMap.set(userId, {
                id: '',
                sessionId: this.session.id,
                userId,
                score,
                createdAt: new Date().toISOString(),
            });
        }

        // Emit to debounced stream
        this.ratingChanges$.next({ userId, score });
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save rating to backend
     */
    private saveRating(userId: string, score: number): void {
        if (!this.session?.id) {
            return;
        }

        this.pendingRatings.add(userId);
        this._changeDetectorRef.markForCheck();

        this._ratingsService
            .upsert(this.session.id, userId, { score })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (rating) => {
                    this.ratingsMap.set(userId, rating);
                    this.pendingRatings.delete(userId);
                    // Reload to get updated stats
                    this.loadRatings();
                },
                error: (error) => {
                    console.error('Failed to save rating:', error);
                    this.pendingRatings.delete(userId);
                    // Rollback on error
                    this.loadRatings();
                },
            });
    }

    /**
     * Reset rating
     */
    resetRating(userId: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Reset rating',
            message: 'Are you sure you want to reset this rating?',
            actions: {
                confirm: {
                    label: 'Reset',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._ratingsService
                    .delete(this.session.id, userId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this.ratingsMap.delete(userId);
                            this.loadRatings();
                        },
                        error: (error) => {
                            console.error('Failed to delete rating:', error);
                        },
                    });
            }
        });
    }

    /**
     * Get participants with YES status
     */
    getConfirmedParticipants(): SessionAttendee[] {
        if (!this.session?.attendances) {
            return [];
        }
        return this.session.attendances.filter(
            (attendance) => attendance.status === 'YES'
        );
    }

    /**
     * Get distribution bar widths
     */
    getDistributionSegments(): number[] {
        if (!this.ratingsResponse?.stats) {
            return Array(11).fill(0);
        }
        return this.ratingsResponse.stats.distribution;
    }

    /**
     * Get max distribution value for normalization
     */
    getMaxDistribution(): number {
        const segments = this.getDistributionSegments();
        return Math.max(...segments, 1);
    }

    /**
     * Calculate opacity for distribution segment
     */
    getSegmentOpacity(value: number): number {
        const max = this.getMaxDistribution();
        if (max === 0) return 0;
        const opacity = value / max;
        return Math.max(0.1, opacity);
    }

    /**
     * Open comment dialog for a participant
     */
    openCommentDialog(attendance: SessionAttendee): void {
        const participantName = `${attendance.user?.firstname} ${attendance.user?.lastname}`;
        const currentRating = this.ratingsMap.get(attendance.userId);

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
                // Save comment with current score
                const score = currentRating?.score || 0;
                this.saveRatingWithComment(attendance.userId, score, comment);
            }
        });
    }

    /**
     * Save rating with comment
     */
    private saveRatingWithComment(
        userId: string,
        score: number,
        comment: string
    ): void {
        if (!this.session?.id) {
            return;
        }

        this.pendingRatings.add(userId);
        this._changeDetectorRef.markForCheck();

        this._ratingsService
            .upsert(this.session.id, userId, { score, comment })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (rating) => {
                    this.ratingsMap.set(userId, rating);
                    this.pendingRatings.delete(userId);
                    this.loadRatings();
                },
                error: (error) => {
                    console.error('Failed to save rating:', error);
                    this.pendingRatings.delete(userId);
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Check if participant has a comment
     */
    hasComment(userId: string): boolean {
        const rating = this.ratingsMap.get(userId);
        return !!(rating?.comment && rating.comment.trim().length > 0);
    }
}
