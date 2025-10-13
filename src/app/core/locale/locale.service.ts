import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root',
})
export class LocaleService {
    constructor(
        private _translocoService: TranslocoService,
        private _dateAdapter: DateAdapter<any>,
        @Inject(LOCALE_ID) private _localeId: string
    ) {
        // Subscribe to language changes and update locale accordingly
        this._translocoService.langChanges$.subscribe((lang) => {
            this.setLocale(lang);
        });
    }

    /**
     * Set the locale for both DateAdapter and Angular's LOCALE_ID
     */
    setLocale(locale: string): void {
        // Update DateAdapter locale (for Material DatePicker)
        this._dateAdapter.setLocale(locale);
        
        // Store current locale
        this._localeId = locale;
    }

    /**
     * Get current locale
     */
    getLocale(): string {
        return this._localeId;
    }
}
