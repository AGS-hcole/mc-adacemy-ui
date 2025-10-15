import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { PerUserRatingDto, SessionListItem } from './reports.types';

@Injectable({ providedIn: 'root' })
export class ReportsExportService {
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
