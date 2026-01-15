import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    Optional,
    SkipSelf,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { TranslocoModule } from '@jsverse/transloco';
import {
    CreateTransportTemplateRequest,
    DayOfWeek,
    TransportTemplate,
    UpdateTransportTemplateRequest,
} from 'app/core/transports/transport.types';
import { TransportsService } from 'app/core/transports/transports.service';
import { Subject, takeUntil } from 'rxjs';
import { AdminTransportTemplateComponent } from '../view/view.component';

@Component({
    selector: 'admin-transport-template-info',
    templateUrl: './info.component.html',
    encapsulation: ViewEncapsulation.None,
    host: { class: 'block w-full h-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        RouterLink,
        CommonModule,
        MatFormFieldModule,
        FuseAlertComponent,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TranslocoModule,
    ],
})
export class AdminTransportTemplateInfoComponent implements OnInit, OnDestroy {
    templateForm: UntypedFormGroup;
    template: TransportTemplate | null = null;
    editMode: boolean = false;

    DayOfWeek = DayOfWeek;
    allDaysOfWeek = [
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
        DayOfWeek.SUNDAY,
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _transportsService: TransportsService,
        @Optional()
        @SkipSelf()
        private _transportTemplateViewComponent: AdminTransportTemplateComponent | null
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Init the form
        this.initForm();

        // Get the template
        this._transportsService.template$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((template) => {
                this.template = template;

                if (this.template) {
                    this.editMode = true;
                    this._patchForm(this.template);
                }

                // Mark for check
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

    initForm() {
        this.templateForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            description: [''],
            fromLabel: ['', [Validators.required]],
            toLabel: ['', [Validators.required]],
            daysOfWeek: [[], [Validators.required]],
            timeOfDay: ['', [Validators.required]],
            capacity: [10, [Validators.required, Validators.min(1)]],
            allowOverbook: [false],
            isActive: [true],
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save template
     */
    saveTemplate(): void {
        if (this.templateForm.invalid) {
            return;
        }

        const formValue = this.templateForm.value;

        if (this.editMode && this.template) {
            // Update existing template
            const updateRequest: UpdateTransportTemplateRequest = {
                name: formValue.name,
                description: formValue.description || null,
                fromLabel: formValue.fromLabel,
                toLabel: formValue.toLabel,
                daysOfWeek: formValue.daysOfWeek,
                timeOfDay: formValue.timeOfDay,
                capacity: formValue.capacity,
                allowOverbook: formValue.allowOverbook,
                isActive: formValue.isActive,
            };

            this._transportsService
                .updateTemplate(this.template.id, updateRequest)
                .subscribe(() => {
                    // Navigate back to template view
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            // Create new template
            const createRequest: CreateTransportTemplateRequest = {
                name: formValue.name,
                description: formValue.description || null,
                fromLabel: formValue.fromLabel,
                toLabel: formValue.toLabel,
                daysOfWeek: formValue.daysOfWeek,
                timeOfDay: formValue.timeOfDay,
                capacity: formValue.capacity,
                allowOverbook: formValue.allowOverbook,
                isActive: formValue.isActive,
            };

            this._transportsService
                .createTemplate(createRequest)
                .subscribe((newTemplate) => {
                    // Navigate to the new template detail page
                    this._router.navigate(['../', newTemplate.id], {
                        relativeTo: this._activatedRoute,
                    });
                });
        }
    }

    /**
     * Cancel
     */
    cancel(): void {
        if (this.editMode) {
            // Just reset the form to original values
            this._patchForm(this.template);
        } else {
            // Navigate back to list
            this._router.navigate(['../'], {
                relativeTo: this._activatedRoute,
            });
        }
    }

    /**
     * Toggle day selection
     */
    toggleDay(day: DayOfWeek): void {
        const currentDays = this.templateForm.get('daysOfWeek').value || [];
        const index = currentDays.indexOf(day);

        if (index > -1) {
            // Remove day
            currentDays.splice(index, 1);
        } else {
            // Add day
            currentDays.push(day);
        }

        this.templateForm.patchValue({ daysOfWeek: [...currentDays] });
    }

    /**
     * Check if day is selected
     */
    isDaySelected(day: DayOfWeek): boolean {
        const currentDays = this.templateForm.get('daysOfWeek').value || [];
        return currentDays.includes(day);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Patch form with template data
     */
    private _patchForm(template: TransportTemplate): void {
        this.templateForm.patchValue({
            name: template.name,
            description: template.description || '',
            fromLabel: template.fromLabel,
            toLabel: template.toLabel,
            daysOfWeek: template.daysOfWeek || [],
            timeOfDay: template.timeOfDay,
            capacity: template.capacity,
            allowOverbook: template.allowOverbook,
            isActive: template.isActive,
        });
    }
}
