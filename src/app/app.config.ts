import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    effect,
    inject,
    isDevMode,
    LOCALE_ID,
    provideAppInitializer,
} from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker, SwUpdate } from '@angular/service-worker';
import { provideFuse } from '@fuse';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { LocaleService } from 'app/core/locale/locale.service';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';

import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';

// Register locale data for French and English
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEn, 'en');

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),

        // Locale ID provider that updates dynamically based on active language
        {
            provide: LOCALE_ID,
            useFactory: () => {
                const translocoService = inject(TranslocoService);
                const activeLang = translocoService.getActiveLang();
                return activeLang || 'fr';
            },
        },

        // Material Date Adapter
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'D',
                },
                display: {
                    dateInput: 'DDD',
                    monthYearLabel: 'LLL yyyy',
                    dateA11yLabel: 'DD',
                    monthYearA11yLabel: 'LLLL yyyy',
                },
            },
        },

        // Transloco Config
        provideTransloco({
            config: {
                availableLangs: [
                    {
                        id: 'en',
                        label: 'English',
                    },
                    {
                        id: 'fr',
                        label: 'Français',
                    },
                ],
                defaultLang: 'fr',
                fallbackLang: 'fr',
                reRenderOnLangChange: true,
                prodMode: !isDevMode(),
            },
            loader: TranslocoHttpLoader,
        }),

        provideAppInitializer(() => {
            const translocoService = inject(TranslocoService);
            const dateAdapter = inject(DateAdapter);
            const defaultLang = translocoService.getDefaultLang();

            translocoService.setActiveLang(defaultLang);
            dateAdapter.setLocale(defaultLang);

            return firstValueFrom(translocoService.load(defaultLang));
        }),

        // Initialize LocaleService to listen to language changes
        provideAppInitializer(() => {
            const localeService = inject(LocaleService);
            // Service will automatically subscribe to language changes in its constructor
            return Promise.resolve();
        }),

        // Service Worker for PWA
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerImmediately',
        }),

        {
            provide: 'swUpdateHandler',
            useFactory: () => {
                const swUpdate = inject(SwUpdate);

                if (!swUpdate.isEnabled) return;

                // effet réactif moderne pour écouter les updates
                effect(() => {
                    swUpdate.versionUpdates.subscribe(async (event) => {
                        if (event.type === 'VERSION_READY') {
                            try {
                                await swUpdate.activateUpdate();
                            } finally {
                                location.reload();
                            }
                        }
                    });

                    // recheck périodique + au retour d’onglet
                    const check = () =>
                        swUpdate.checkForUpdate().catch(() => {});
                    setInterval(check, 60_000);
                    document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState === 'visible') check();
                    });

                    // si le SW devient irrécupérable → reload
                    swUpdate.unrecoverable.subscribe(() => location.reload());
                });
            },
        },

        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            fuse: {
                layout: 'classy',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-mycenter',
                themes: [
                    {
                        id: 'theme-mycenter',
                        name: 'MyCenter',
                    },
                ],
            },
        }),
    ],
};
