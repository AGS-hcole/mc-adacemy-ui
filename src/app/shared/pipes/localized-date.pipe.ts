import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

/**
 * LocalizedDatePipe - A date pipe that automatically formats dates
 * according to the currently active language in Transloco.
 * 
 * Usage: {{ date | localizedDate:'fullDate' }}
 *        {{ date | localizedDate:'shortDate' }}
 */
@Pipe({
    name: 'localizedDate',
    standalone: true,
    pure: false, // Make it impure so it updates when language changes
})
export class LocalizedDatePipe implements PipeTransform {
    constructor(private _translocoService: TranslocoService) {}

    transform(value: any, format?: string, timezone?: string): string | null {
        if (!value) {
            return null;
        }

        // Get the current active language
        const locale = this._translocoService.getActiveLang();

        // Create a new DatePipe instance with the current locale
        const datePipe = new DatePipe(locale);

        // Map custom format names to Angular date format strings
        const formatMap: Record<string, string> = {
            'fullDateTime': 'EEEE, d MMMM y, HH:mm',
            'shortDateTime': 'dd/MM/yyyy HH:mm',
            'fullDate': 'EEEE, d MMMM y',
            'shortDate': 'dd/MM/yyyy',
            'timeOnly': 'HH:mm',
        };

        // Use mapped format or pass through the original format
        const angularFormat = formatMap[format || ''] || format;

        // Transform the date using the localized DatePipe
        return datePipe.transform(value, angularFormat, timezone);
    }
}
