/**
 * Format a stored session time (UTC-based DateTime used as a time container)
 * Returns HH:mm or '' if invalid
 */
export function formatStoredSessionTime(isoString?: string | null): string {
    if (!isoString) {
        return '';
    }

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
        return '';
    }

    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sessionTime',
    standalone: true,
})
export class SessionTimePipe implements PipeTransform {
    transform(value?: string | Date | null): string {
        if (!value) {
            return '';
        }

        const date = value instanceof Date ? value : new Date(value);

        if (isNaN(date.getTime())) {
            return '';
        }

        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    }
}
