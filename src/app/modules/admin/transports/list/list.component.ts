import { NgClass, NgForOf, NgIf } from '@angular/common';
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
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import {
    DayOfWeek,
    TransportTemplate,
    TransportTemplateFilters,
} from 'app/core/transports/transport.types';
import { TransportsService } from 'app/core/transports/transports.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-transports-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgIf,
        NgForOf,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        MatMenuModule,
        TranslocoModule,
    ],
})
export class AdminTransportsListComponent implements OnInit, OnDestroy {
    templates: TransportTemplate[] = [];

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedIsActive: boolean | null = true; // Default to active only

    DayOfWeek = DayOfWeek;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _transportsService: TransportsService,
        private _matDialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._transportsService.templates$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((templates) => {
                this.templates = templates;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input
        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe(() => {
                this.loadTemplates();
            });

        // Load templates with default filters
        this.loadTemplates();
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
     * Load templates with filters
     */
    loadTemplates(): void {
        const filters: TransportTemplateFilters = {
            search: this.searchInputControl.value || null,
            isActive: this.selectedIsActive,
        };

        this._transportsService.getTemplates(filters).subscribe();
    }

    /**
     * Filter change handler
     */
    onFilterChange(): void {
        this.loadTemplates();
    }

    /**
     * Create new template
     */
    createTemplate(): void {
        this._router.navigate(['./new'], { relativeTo: this._activatedRoute });
    }

    /**
     * View template details
     */
    viewTemplate(templateId: string): void {
        this._router.navigate(['./', templateId], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Disable template
     */
    disableTemplate(template: TransportTemplate): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.DISABLE_TEMPLATE.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.DISABLE_TEMPLATE.MESSAGE'
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.DISABLE_TEMPLATE.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._transportsService
                    .disableTemplate(template.id)
                    .subscribe(() => {
                        this.loadTemplates();
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Get days of week display
     */
    getDaysDisplay(daysOfWeek: DayOfWeek[]): string {
        if (!daysOfWeek || daysOfWeek.length === 0) return '-';
        if (daysOfWeek.length === 7) return this._translocoService.translate('TRANSPORTS.ADMIN.EVERY_DAY');
        return daysOfWeek
            .map((day) => this._translocoService.translate(`TRANSPORTS.DAYS.${day}_SHORT`))
            .join(', ');
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
