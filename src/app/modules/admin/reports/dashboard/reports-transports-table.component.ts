import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ReportsExportService } from 'app/core/reports/reports-export.service';
import { TransportsListDto } from 'app/core/reports/reports.types';
import { DateTime } from 'luxon';

@Component({
    selector: 'reports-transports-table',
    templateUrl: './reports-transports-table.component.html',
    standalone: true,
    imports: [
        CommonModule,
        NgClass,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class ReportsTransportsTableComponent {
    @Input() transportsList: TransportsListDto | null = null;
    @Input() loading = false;

    displayedColumns: string[] = [
        'departureAt',
        'user',
        'template',
        'route',
        'status',
        'seats',
    ];

    constructor(private _export: ReportsExportService) {}

    formatDate(isoDate: string): string {
        return DateTime.fromISO(isoDate)
            .setZone('Europe/Paris')
            .toLocaleString(DateTime.DATETIME_SHORT, { locale: 'fr-FR' });
    }

    getStatusLabel(status: string): string {
        return status === 'CONFIRMED' ? 'Confirmée' : 'Annulée';
    }

    getStatusClass(status: string): string {
        return status === 'CONFIRMED'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    }

    exportCsv(): void {
        if (this.transportsList && this.transportsList.items.length > 0) {
            this._export.exportTransportsCsv(this.transportsList.items);
        }
    }

    exportJson(): void {
        if (this.transportsList && this.transportsList.items.length > 0) {
            this._export.exportTransportsJson(this.transportsList.items);
        }
    }
}
