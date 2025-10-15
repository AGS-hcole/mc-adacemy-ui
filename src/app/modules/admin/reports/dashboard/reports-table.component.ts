import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ReportsExportService } from 'app/core/reports/reports-export.service';
import { SessionsListDto } from 'app/core/reports/reports.types';
import { DateTime } from 'luxon';

@Component({
    selector: 'reports-table',
    templateUrl: './reports-table.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class ReportsTableComponent {
    @Input() sessionsList: SessionsListDto | null = null;
    @Input() loading = false;
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() viewSession = new EventEmitter<string>();

    displayedColumns: string[] = [
        'date',
        'title',
        'coach',
        'contractType',
        'attendeesCount',
        'status',
        'actions',
    ];

    /**
     * Constructor
     */
    constructor(private _export: ReportsExportService) {}

    /**
     * Format date for display
     */
    formatDate(isoDate: string): string {
        return DateTime.fromISO(isoDate)
            .setZone('Europe/Paris')
            .toLocaleString(DateTime.DATETIME_SHORT, { locale: 'fr-FR' });
    }

    /**
     * Get contract type label
     */
    getContractTypeLabel(type: string): string {
        return type === 'UNDER' ? 'Sous contrat' : 'Hors contrat';
    }

    /**
     * Get status label
     */
    getStatusLabel(status: string): string {
        switch (status) {
            case 'SCHEDULED':
                return 'Programmé';
            case 'DONE':
                return 'Terminé';
            case 'CANCELLED':
                return 'Annulé';
            default:
                return status;
        }
    }

    /**
     * Get status class
     */
    getStatusClass(status: string): string {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800';
            case 'DONE':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.pageChange.emit(event);
    }

    /**
     * Handle view session
     */
    onViewSession(sessionId: string): void {
        this.viewSession.emit(sessionId);
    }

    /**
     * Export CSV
     */
    exportCsv(): void {
        if (this.sessionsList && this.sessionsList.items.length > 0) {
            this._export.exportCsv(this.sessionsList.items);
        }
    }

    /**
     * Export JSON
     */
    exportJson(): void {
        if (this.sessionsList && this.sessionsList.items.length > 0) {
            this._export.exportJson(this.sessionsList.items);
        }
    }
}
