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

        // Transform the date using the localized DatePipe
        return datePipe.transform(value, format, timezone);
    }
}
