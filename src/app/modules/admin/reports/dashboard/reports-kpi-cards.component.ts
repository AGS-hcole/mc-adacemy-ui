import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { SessionsSummaryDto } from 'app/core/reports/reports.types';

@Component({
    selector: 'reports-kpi-cards',
    templateUrl: './reports-kpi-cards.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslocoModule],
})
export class ReportsKpiCardsComponent {
    @Input() summary: SessionsSummaryDto | null = null;
    @Input() loading = false;
}
