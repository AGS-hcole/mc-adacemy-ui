import { NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PlanningApi } from 'app/core/api/planning.api';
import { SchoolDto, TransportTemplateDto } from 'app/core/models/planning';
import { Subject, forkJoin, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-transport-templates',
    templateUrl: './transport-templates.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TransportTemplatesComponent implements OnInit, OnDestroy {
    templates: TransportTemplateDto[] = [];
    schools: SchoolDto[] = [];
    isLoading = true;
    drawerOpened = false;
    form: FormGroup;
    selectedTemplate: TransportTemplateDto | null = null;
    isSaving = false;

    daysOfWeek = [
        { value: 1, label: 'PLANNING.MONDAY' },
        { value: 2, label: 'PLANNING.TUESDAY' },
        { value: 3, label: 'PLANNING.WEDNESDAY' },
        { value: 4, label: 'PLANNING.THURSDAY' },
        { value: 5, label: 'PLANNING.FRIDAY' },
        { value: 6, label: 'PLANNING.SATURDAY' },
        { value: 7, label: 'PLANNING.SUNDAY' },
    ];

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _formBuilder: FormBuilder,
        private _planningApi: PlanningApi,
        private _changeDetectorRef: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._loadData();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _initForm(): void {
        this.form = this._formBuilder.group({
            name: ['', Validators.required],
            direction: ['GO', Validators.required],
            originLabel: ['Manoir', Validators.required],
            destinationId: ['', Validators.required],
            targetTime: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
            capacity: [8, [Validators.required, Validators.min(1)]],
            daysOfWeek: [[], Validators.required],
            activeFrom: [null],
            activeTo: [null],
            defaultDriverId: [null],
            defaultVehicle: [''],
        });
    }

    private _loadData(): void {
        this.isLoading = true;
        forkJoin({
            templates: this._planningApi.listTransportTemplates(),
            schools: this._planningApi.listSchools(),
        })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ({ templates, schools }) => {
                    this.templates = templates;
                    this.schools = schools;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading templates:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    openDrawer(template?: TransportTemplateDto): void {
        this.selectedTemplate = template || null;
        this.drawerOpened = true;

        if (template) {
            this.form.patchValue({
                name: template.name,
                direction: template.direction,
                originLabel: template.originLabel,
                destinationId: template.destinationId,
                targetTime: template.targetTime,
                capacity: template.capacity,
                daysOfWeek: template.daysOfWeek,
                activeFrom: template.activeFrom,
                activeTo: template.activeTo,
                defaultDriverId: template.defaultDriverId,
                defaultVehicle: template.defaultVehicle,
            });
        } else {
            this.form.reset({
                direction: 'GO',
                originLabel: 'Manoir',
                capacity: 8,
                daysOfWeek: [],
            });
        }

        this._changeDetectorRef.markForCheck();
    }

    closeDrawer(): void {
        this.drawerOpened = false;
        this.selectedTemplate = null;
        this.form.reset();
        this._changeDetectorRef.markForCheck();
    }

    onSave(): void {
        if (this.form.invalid) {
            return;
        }

        this.isSaving = true;
        const formValue = this.form.value;

        const payload = {
            name: formValue.name,
            direction: formValue.direction,
            originLabel: formValue.originLabel,
            destinationId: formValue.destinationId,
            targetTime: formValue.targetTime,
            capacity: formValue.capacity,
            daysOfWeek: formValue.daysOfWeek,
            activeFrom: formValue.activeFrom || null,
            activeTo: formValue.activeTo || null,
            defaultDriverId: formValue.defaultDriverId || null,
            defaultVehicle: formValue.defaultVehicle || null,
        };

        const request = this.selectedTemplate
            ? this._planningApi.updateTransportTemplate(this.selectedTemplate.id, payload)
            : this._planningApi.createTransportTemplate(payload);

        request.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: () => {
                this.isSaving = false;
                this.closeDrawer();
                this._loadData();
            },
            error: (error) => {
                console.error('Error saving template:', error);
                this.isSaving = false;
                this._changeDetectorRef.markForCheck();
            },
        });
    }

    onDelete(template: TransportTemplateDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('TEMPLATES.DELETE'),
            message: this._translocoService.translate('TEMPLATES.DELETE_CONFIRM'),
            actions: {
                confirm: {
                    label: this._translocoService.translate('COMMON.DELETE'),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._planningApi
                    .deleteTransportTemplate(template.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._loadData();
                        },
                        error: (error) => {
                            console.error('Error deleting template:', error);
                        },
                    });
            }
        });
    }
}
