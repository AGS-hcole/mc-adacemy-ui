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
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Site } from 'app/core/session/session.types';
import { SitesService } from 'app/core/sites/sites.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-site-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TranslocoModule,
    ],
})
export class AdminSiteDetailsComponent implements OnInit, OnDestroy {
    siteForm: UntypedFormGroup;
    site: Site | null = null;
    editMode: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _sitesService: SitesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.siteForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            address: [''],
            city: [''],
        });

        // Get site if editing
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((params) => {
                if (params['id'] && params['id'] !== 'new') {
                    this.editMode = true;
                    this._sitesService
                        .getSiteById(params['id'])
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((site) => {
                            this.site = site;
                            this._patchForm(site);
                            this._changeDetectorRef.markForCheck();
                        });
                } else {
                    this.editMode = false;
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this._sitesService.resetSite();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Save site
     */
    saveSite(): void {
        if (this.siteForm.invalid) {
            return;
        }

        const formValue = this.siteForm.value;

        if (this.editMode && this.site) {
            // Update existing site
            const updateData: Partial<Site> = {
                name: formValue.name,
                address: formValue.address || null,
                city: formValue.city || null,
            };

            this._sitesService
                .updateSite(this.site.id, updateData)
                .subscribe(() => {
                    this._router.navigate(['../'], {
                        relativeTo: this._activatedRoute,
                    });
                });
        } else {
            // Create new site
            const createData: Partial<Site> = {
                name: formValue.name,
                address: formValue.address || null,
                city: formValue.city || null,
            };

            this._sitesService.createSite(createData).subscribe(() => {
                this._router.navigate(['../'], {
                    relativeTo: this._activatedRoute,
                });
            });
        }
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Patch form with site data
     */
    private _patchForm(site: Site): void {
        this.siteForm.patchValue({
            name: site.name,
            address: site.address || '',
            city: site.city || '',
        });
    }
}
