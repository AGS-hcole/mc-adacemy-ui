import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
})
export class AppComponent {
    private swUpdate = inject(SwUpdate);

    /**
     * Constructor
     */
    constructor() {
        if (this.swUpdate.isEnabled) {
            // 1) Détecte puis active l’update et recharge
            this.swUpdate.versionUpdates.subscribe(async (e) => {
                // e.type === 'VERSION_READY' dans les nouvelles versions d’Angular
                try {
                    await this.swUpdate.activateUpdate();
                } finally {
                    document.location.reload();
                }
            });

            // 2) Optionnel : check régulier
            setInterval(() => this.swUpdate.checkForUpdate(), 60_000); // toutes les 60s
        }
    }
}
