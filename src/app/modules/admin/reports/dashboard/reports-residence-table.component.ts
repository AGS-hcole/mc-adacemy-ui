import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ReportsExportService } from 'app/core/reports/reports-export.service';
import { ResidenceListDto } from 'app/core/reports/reports.types';
import { DateTime } from 'luxon';

@Component({
    selector: 'reports-residence-table',
    templateUrl: './reports-residence-table.component.html',
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
export class ReportsResidenceTableComponent {
    @Input() residenceList: ResidenceListDto | null = null;
    @Input() loading = false;

    displayedColumns: string[] = [
        'date',
        'user',
        'manor',
        'status',
        'overCapacity',
        'createdByAdmin',
    ];

    constructor(private _export: ReportsExportService) {}

    formatDate(isoDate: string): string {
        return DateTime.fromISO(isoDate)
            .setZone('Europe/Paris')
            .toLocaleString(DateTime.DATETIME_SHORT, { locale: 'fr-FR' });
    }

    getStatusLabel(status: string): string {
        return status === 'PLANNED' ? 'Planifiée' : 'Annulée';
    }

    getStatusClass(status: string): string {
        return status === 'PLANNED'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800';
    }

    exportCsv(): void {
        if (this.residenceList && this.residenceList.items.length > 0) {
            this._export.exportResidenceCsv(this.residenceList.items);
        }
    }

    exportJson(): void {
        if (this.residenceList && this.residenceList.items.length > 0) {
            this._export.exportResidenceJson(this.residenceList.items);
        }
    }
}
