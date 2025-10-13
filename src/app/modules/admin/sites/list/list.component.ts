import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { Site } from 'app/core/session/session.types';
import { SitesService } from 'app/core/sites/sites.service';
import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-sites-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        NgIf,
        NgForOf,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class AdminSitesListComponent implements OnInit, OnDestroy {
    sites$: Observable<Site[]>;

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    filteredSites: Site[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _sitesService: SitesService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get sites from resolver
        this.sites$ = this._sitesService.sites$;

        // Subscribe to search input
        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter sites based on search input
     */
    filterSites(sites: Site[]): Site[] {
        const searchTerm = this.searchInputControl.value?.toLowerCase() || '';

        if (!searchTerm) {
            return sites;
        }

        return sites.filter(
            (site) =>
                site.name.toLowerCase().includes(searchTerm) ||
                site.address?.toLowerCase().includes(searchTerm) ||
                site.city?.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Create new site
     */
    createSite(): void {
        this._router.navigate(['./new'], { relativeTo: this._activatedRoute });
    }

    /**
     * Edit site
     */
    editSite(siteId: string): void {
        this._router.navigate(['./', siteId], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Delete site
     */
    deleteSite(site: Site): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete site',
            message: `Are you sure you want to delete "${site.name}"? This action cannot be undone.`,
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sitesService.deleteSite(site.id).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                });
            }
        });
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
