import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DateTime } from 'luxon';
import {
    PerUserRatingDto,
    ResidenceListItem,
    SessionListItem,
    TransportsListItem,
} from './reports.types';

@Injectable({ providedIn: 'root' })
export class ReportsExportService {
    constructor(private _translocoService: TranslocoService) {}

    /**
     * Export data as CSV
     */
    exportCsv(items: SessionListItem[], filename: string = 'sessions-export'): void {
        const headers = ['Date', 'Title', 'Coach', 'Contract Type', 'Attendees', 'Status'];
        const rows = items.map((item) => [
            this.formatDate(item.date),
            this.escapeCsv(item.title),
            this.escapeCsv(item.coachName || '-'),
            item.contractType === 'UNDER' ? 'Under Contract' : 'Off Contract',
            item.attendeesCount.toString(),
            item.status,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export data as JSON
     */
    exportJson(items: SessionListItem[], filename: string = 'sessions-export'): void {
        const jsonContent = JSON.stringify(items, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
    }

    /**
     * Export residence data as CSV
     */
    exportResidenceCsv(
        items: ResidenceListItem[],
        filename: string = 'residence-export'
    ): void {
        const headers = ['Date', 'User', 'Residence', 'Status', 'Over Capacity', 'Created By Admin'];
        const rows = items.map((item) => [
            this.formatDate(item.date),
            this.escapeCsv(`${item.user.firstname} ${item.user.lastname}`),
            this.escapeCsv(item.manor?.name || '-'),
            this.getResidenceStatusLabel(item.status),
            this.getBooleanLabel(item.overCapacity),
            this.getBooleanLabel(item.createdByAdmin),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export residence data as JSON
     */
    exportResidenceJson(
        items: ResidenceListItem[],
        filename: string = 'residence-export'
    ): void {
        const jsonContent = JSON.stringify(items, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
    }

    /**
     * Export transport data as CSV
     */
    exportTransportsCsv(
        items: TransportsListItem[],
        filename: string = 'transports-export'
    ): void {
        const headers = ['Departure', 'User', 'Transport', 'Route', 'Status', 'Seats'];
        const rows = items.map((item) => [
            this.formatDate(item.departureAt),
            this.escapeCsv(`${item.user.firstname} ${item.user.lastname}`),
            this.escapeCsv(item.template?.name || '-'),
            this.escapeCsv(
                item.template
                    ? `${item.template.fromLabel} → ${item.template.toLabel}`
                    : '-'
            ),
            this.getTransportStatusLabel(item.status),
            item.seats.toString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export transport data as JSON
     */
    exportTransportsJson(
        items: TransportsListItem[],
        filename: string = 'transports-export'
    ): void {
        const jsonContent = JSON.stringify(items, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
    }

    /**
     * Export ratings data as CSV
     */
    exportRatingsCsv(items: PerUserRatingDto[], filename: string = 'ratings-export'): void {
        const headers = ['Student Name', 'Average Rating', 'Number of Ratings'];
        const rows = items.map((item) => [
            this.escapeCsv(`${item.user.firstName} ${item.user.lastName}`),
            item.average.toFixed(1),
            item.count.toString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export ratings data as JSON
     */
    exportRatingsJson(items: PerUserRatingDto[], filename: string = 'ratings-export'): void {
        const jsonContent = JSON.stringify(items, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Format date for export
     */
    private formatDate(isoDate: string): string {
        return DateTime.fromISO(isoDate)
            .setZone('Europe/Paris')
            .toLocaleString(DateTime.DATETIME_SHORT, { locale: 'fr-FR' });
    }

    /**
     * Escape CSV field
     */
    private escapeCsv(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    private getBooleanLabel(value: boolean): string {
        return this._translocoService.translate(value ? 'COMMON.YES' : 'COMMON.NO');
    }

    private getResidenceStatusLabel(status: ResidenceListItem['status']): string {
        return this._translocoService.translate(
            status === 'PLANNED'
                ? 'REPORTS.RESIDENCE.STATUS.PLANNED'
                : 'REPORTS.RESIDENCE.STATUS.CANCELED'
        );
    }

    private getTransportStatusLabel(status: TransportsListItem['status']): string {
        return this._translocoService.translate(
            status === 'CONFIRMED'
                ? 'REPORTS.TRANSPORTS.STATUS.CONFIRMED'
                : 'REPORTS.TRANSPORTS.STATUS.CANCELLED'
        );
    }

    /**
     * Download file
     */
    private downloadFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}
