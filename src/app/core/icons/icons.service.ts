import { inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconsService {
    /**
     * Constructor
     */
    constructor() {
        const domSanitizer = inject(DomSanitizer);
        const matIconRegistry = inject(MatIconRegistry);

        // Register icon sets
        matIconRegistry.addSvgIconSet(
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/material-twotone.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'mat_outline',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/material-outline.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'mat_solid',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/material-solid.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'feather',
            domSanitizer.bypassSecurityTrustResourceUrl('icons/feather.svg')
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'heroicons_outline',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/heroicons-outline.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'heroicons_solid',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/heroicons-solid.svg'
            )
        );
        matIconRegistry.addSvgIconSetInNamespace(
            'heroicons_mini',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/heroicons-mini.svg'
            )
        );

        // Specific Veeam M365 Icons
        matIconRegistry.addSvgIcon(
            'veeam-365-exchange',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/veeam-m365/exchange.svg'
            )
        );

        matIconRegistry.addSvgIcon(
            'veeam-365-sharepoint',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/veeam-m365/sharepoint.svg'
            )
        );

        matIconRegistry.addSvgIcon(
            'veeam-365-onedrive',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/veeam-m365/onedrive.svg'
            )
        );

        matIconRegistry.addSvgIcon(
            'veeam-365-teams',
            domSanitizer.bypassSecurityTrustResourceUrl(
                'icons/veeam-m365/teams.svg'
            )
        );
    }
}
