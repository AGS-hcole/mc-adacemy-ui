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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { SessionSlot } from 'app/core/session/session.types';
import {
    DashboardParticipantDto,
    DashboardSessionDto,
} from '../models/admin-dashboard.models';

@Component({
    selector: 'sessions-day-card',
    templateUrl: './sessions-day-card.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class SessionsDayCardComponent {
    @Input() sessions: DashboardSessionDto[] = [];
    @Input() loading = false;
    @Output() editRating = new EventEmitter<{
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
     * Handle edit rating click
     */
    onEditRating(
        sessionId: string,
        participant: DashboardParticipantDto
    ): void {
        console.log('Emitting edit rating for participant:', participant);
        this.editRating.emit({ sessionId, participant });
    }

    /**
     * Get rating score display
     */
    getRatingDisplay(participant: DashboardParticipantDto): string {
        if (participant.rating) {
            return `${participant.rating.score}/10`;
        }
        return 'Not rated';
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
