import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import {
    DashboardManorDto,
    DashboardStayDto,
} from '../models/admin-dashboard.models';

@Component({
    selector: 'manors-day-card',
    templateUrl: './manors-day-card.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class ManorsDayCardComponent {
    @Input() manors: DashboardManorDto[] = [];
    @Input() loading = false;

    expandedManors = new Set<string>();

    /**
     * Toggle manor expansion
     */
    toggleManor(manorId: string): void {
        if (this.expandedManors.has(manorId)) {
            this.expandedManors.delete(manorId);
        } else {
            this.expandedManors.add(manorId);
        }
    }

    /**
     * Check if manor is expanded
     */
    isExpanded(manorId: string): boolean {
        return this.expandedManors.has(manorId);
    }

    /**
     * Get visible stays (limit to 5 if not expanded)
     */
    getVisibleStays(manor: DashboardManorDto): DashboardStayDto[] {
        const stays = manor.stays.filter((s) => s.status === 'PLANNED');
        if (this.isExpanded(manor.id)) {
            return stays;
        }
        return stays.slice(0, 5);
    }

    /**
     * Check if manor has over-capacity stays
     */
    hasOverCapacity(manor: DashboardManorDto): boolean {
        return manor.stays.some((s) => s.overCapacity);
    }

    /**
     * Get active stays count
     */
    getActiveStaysCount(manor: DashboardManorDto): number {
        return manor.stays.filter((s) => s.status === 'PLANNED').length;
    }

    /**
     * Check if show more button should be displayed
     */
    shouldShowMore(manor: DashboardManorDto): boolean {
        const activeStays = manor.stays.filter((s) => s.status === 'PLANNED');
        return activeStays.length > 5;
    }

    /**
     * Track by manor ID
     */
    trackByManorId(index: number, manor: DashboardManorDto): string {
        return manor.id;
    }

    /**
     * Track by stay ID
     */
    trackByStayId(index: number, stay: DashboardStayDto): string {
        return stay.id;
    }
}
