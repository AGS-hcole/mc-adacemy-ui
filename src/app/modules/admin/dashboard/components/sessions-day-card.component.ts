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
     * Group sessions by slot and site
     */
    getGroupedSessions(): {
        slot: SessionSlot;
        slotLabel: string;
        sites: { siteName: string; sessions: DashboardSessionDto[] }[];
    }[] {
        const groups = new Map<
            SessionSlot,
            Map<string, DashboardSessionDto[]>
        >();

        // Group by slot, then by site
        this.sessions.forEach((session) => {
            if (!groups.has(session.slot)) {
                groups.set(session.slot, new Map());
            }
            const siteGroups = groups.get(session.slot)!;
            const siteName = session.site.name;
            if (!siteGroups.has(siteName)) {
                siteGroups.set(siteName, []);
            }
            siteGroups.get(siteName)!.push(session);
        });

        // Convert to array format
        const result: {
            slot: SessionSlot;
            slotLabel: string;
            sites: { siteName: string; sessions: DashboardSessionDto[] }[];
        }[] = [];

        // Sort by slot (AM first, then PM)
        const sortedSlots = Array.from(groups.keys()).sort((a, b) => {
            if (a === SessionSlot.AM) return -1;
            if (b === SessionSlot.AM) return 1;
            return 0;
        });

        sortedSlots.forEach((slot) => {
            const siteGroups = groups.get(slot)!;
            const sites: {
                siteName: string;
                sessions: DashboardSessionDto[];
            }[] = [];

            siteGroups.forEach((sessions, siteName) => {
                sites.push({ siteName, sessions });
            });

            result.push({
                slot,
                slotLabel: slot === SessionSlot.AM ? 'Morning' : 'Afternoon',
                sites,
            });
        });

        return result;
    }

    /**
     * Get time range display for session
     */
    getTimeRange(session: DashboardSessionDto): string {
        // Helper to parse ISO date string and return local time string in HH:mm
        const toLocalTime = (
            isoString: string | undefined,
            fallback: string
        ): string => {
            if (!isoString) return fallback;
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return fallback;
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        const defaultStart =
            session.slot === SessionSlot.AM ? '09:00' : '14:00';
        const defaultEnd = session.slot === SessionSlot.AM ? '12:00' : '17:00';

        const start = toLocalTime(session.startTime, defaultStart);
        const end = toLocalTime(session.endTime, defaultEnd);

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
