import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { SessionSlot } from 'app/core/session/session.types';
import { StarRatingComponent } from 'app/shared/components/star-rating/star-rating.component';
import { formatStoredSessionTime } from 'app/shared/helpers/date.helper';
import {
    DashboardParticipantDto,
    DashboardSessionDto,
} from '../models/admin-dashboard.models';

@Component({
    selector: 'sessions-day-card',
    templateUrl: './sessions-day-card.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        StarRatingComponent,
    ],
})
export class SessionsDayCardComponent {
    @Input() sessions: DashboardSessionDto[] = [];
    @Input() loading = false;
    @Input() pendingRatings = new Set<string>();
    @Output() ratingChange = new EventEmitter<{
        sessionId: string;
        participant: DashboardParticipantDto;
        score: number;
    }>();
    @Output() openCommentDialog = new EventEmitter<{
        sessionId: string;
        participant: DashboardParticipantDto;
    }>();

    readonly SessionSlot = SessionSlot;

    /**
     * Get sessions sorted by start time
     */
    getSortedSessions(): DashboardSessionDto[] {
        return [...this.sessions].sort((a, b) => {
            // Parse start times or use defaults based on slot
            const getTime = (session: DashboardSessionDto): number => {
                if (session.startTime) {
                    const date = new Date(session.startTime);
                    if (!isNaN(date.getTime())) {
                        return date.getTime();
                    }
                }
                // Fallback: AM = 9:00, PM = 14:00
                const today = new Date();
                today.setHours(
                    session.slot === SessionSlot.AM ? 9 : 14,
                    0,
                    0,
                    0
                );
                return today.getTime();
            };

            return getTime(a) - getTime(b);
        });
    }

    /**
     * Get display time for session
     */
    getDisplayTime(session: DashboardSessionDto): string {
        const start = formatStoredSessionTime(session.startTime);
        const end = formatStoredSessionTime(session.endTime);

        if (!start && !end) {
            return '';
        }

        return `${start} - ${end}`;
    }

    /**
     * Get participants with YES status
     */
    getConfirmedParticipants(
        session: DashboardSessionDto
    ): DashboardParticipantDto[] {
        return session.participants.filter((p) => p.status === 'YES');
    }

    /**
     * Handle rating change
     */
    onRatingChange(
        sessionId: string,
        participant: DashboardParticipantDto,
        score: number
    ): void {
        console.log('Rating changed:', { sessionId, participant, score });
        this.ratingChange.emit({ sessionId, participant, score });
    }

    /**
     * Handle comment button click
     */
    onCommentClick(
        sessionId: string,
        participant: DashboardParticipantDto
    ): void {
        this.openCommentDialog.emit({ sessionId, participant });
    }

    /**
     * Get rating score for participant
     */
    getRatingScore(participant: DashboardParticipantDto): number {
        console.log(participant);
        return participant.rating?.score ?? 0;
    }

    /**
     * Check if participant has a comment
     */
    hasComment(participant: DashboardParticipantDto): boolean {
        return !!(
            participant.rating?.comment &&
            participant.rating.comment.trim().length > 0
        );
    }

    /**
     * Check if rating is pending for participant
     */
    isRatingPending(participant: DashboardParticipantDto): boolean {
        return this.pendingRatings.has(participant.userId);
    }

    /**
     * Track by function for ngFor
     */
    trackBySessionId(index: number, session: DashboardSessionDto): string {
        return session.id;
    }

    /**
     * Track by participant
     */
    trackByParticipantId(
        index: number,
        participant: DashboardParticipantDto
    ): string {
        return participant.userId;
    }
}
