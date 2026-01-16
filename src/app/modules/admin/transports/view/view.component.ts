import { DatePipe, NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    MatDrawer,
    MatDrawerContainer,
    MatSidenavModule,
} from '@angular/material/sidenav';
import {
    ActivatedRoute,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TranslocoModule } from '@jsverse/transloco';
import { TransportTemplate } from 'app/core/transports/transport.types';
import { TransportsService } from 'app/core/transports/transports.service';
import { Subject, take, takeUntil } from 'rxjs';
import { panels } from './view.data';

@Component({
    selector: 'admin-transport-template-view',
    templateUrl: './view.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterOutlet,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        TranslocoModule,
        RouterLink,
        NgClass,
    ],
    host: {
        class: 'h-full',
    },
})
export class AdminTransportTemplateComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild('drawer') drawer: MatDrawer;
    @ViewChild(MatDrawerContainer) drawerContainer!: MatDrawerContainer;

    template: TransportTemplate;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = panels;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _fuseMediaWatcherService: FuseMediaWatcherService,
        private readonly router: Router,
        private readonly _activatedRoute: ActivatedRoute,
        private readonly ngZone: NgZone,
        private readonly _transportsService: TransportsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the template
        this._transportsService.template$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((template) => {
                this.template = template;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // This is necessary to ensure that the drawer is available in the view
        // and that the content of the drawer is rendered with correct margins
        this.ngZone.onStable.pipe(take(1)).subscribe(() => {
            window.dispatchEvent(new Event('resize'));
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void {
        // Navigate to the panel
        this.router.navigate(['./', panel], {
            relativeTo: this._activatedRoute,
        });

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    /**
     *
     * @returns Check if panel is active
     * @param panelId
     */
    isPanelActive(panelId: string): boolean {
        // Get the current route
        const currentRoute = this.router.routerState.snapshot.url;

        // Check if the current route contains the panel id
        return currentRoute.includes(panelId);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
