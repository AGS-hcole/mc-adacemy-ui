import { NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent } from '@fuse/components/alert';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PlanningApi } from 'app/core/api/planning.api';
import {
    TransportDirection,
    TransportTemplateDto,
    TransportWeekPlanDto,
} from 'app/core/models/planning';
import { DateTime } from 'luxon';
import { Subject, forkJoin, takeUntil } from 'rxjs';

interface TransportEntry {
    date: string;
    dateLabel: string;
    isoDate: string;
    goTemplateId: string | null;
    returnTemplateId: string | null;
}

@Component({
    selector: 'user-transport-planning-panel',
    templateUrl: './transport-panel.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatOptionModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        TranslocoModule,
        FuseAlertComponent,
    ],
})
export class TransportPlanningPanelComponent implements OnInit, OnDestroy {
    form: FormGroup;
    weekDays: { date: string; label: string; isoDate: string; dayOfWeek: number }[] = [];
    weekStartDate: string;
    templates: TransportTemplateDto[] = [];
    goTemplates: TransportTemplateDto[] = [];
    returnTemplates: TransportTemplateDto[] = [];
    isLoading = true;
    isSaving = false;
    isWindowOpen = true;
    showSuccessAlert = false;
    showErrorAlert = false;
    errorMessage = '';

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _formBuilder: FormBuilder,
        private _planningApi: PlanningApi,
        private _changeDetectorRef: ChangeDetectorRef,
        private _translocoService: TranslocoService
    ) {}

    ngOnInit(): void {
        this._computeNextWeek();
        this._checkWindowStatus();
        this._initForm();
        this._loadData();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _computeNextWeek(): void {
        // Get next Monday
        const now = DateTime.now().setZone('Europe/Paris');
        let nextMonday = now.plus({ weeks: 1 }).startOf('week');

        this.weekStartDate = nextMonday.toISODate();

        // Generate week days
        this.weekDays = [];
        for (let i = 0; i < 7; i++) {
            const date = nextMonday.plus({ days: i });
            this.weekDays.push({
                date: date.toFormat('EEEE d MMMM', { locale: 'fr' }),
                label: date.toFormat('EEEE', { locale: 'fr' }),
                isoDate: date.toISODate(),
                dayOfWeek: date.weekday,
            });
        }
    }

    private _checkWindowStatus(): void {
        // Check if current time is weekend (Saturday or Sunday)
        const now = DateTime.now().setZone('Europe/Paris');
        const dayOfWeek = now.weekday;
        this.isWindowOpen = dayOfWeek === 6 || dayOfWeek === 7; // Saturday=6, Sunday=7
    }

    private _initForm(): void {
        const daysArray = this.weekDays.map((day) =>
            this._formBuilder.group({
                date: [day.isoDate],
                goTemplateId: [null],
                returnTemplateId: [null],
            })
        );

        this.form = this._formBuilder.group({
            days: this._formBuilder.array(daysArray),
        });

        if (!this.isWindowOpen) {
            this.form.disable();
        }
    }

    private _loadData(): void {
        this.isLoading = true;
        forkJoin({
            templates: this._planningApi.listTransportTemplates(),
            plan: this._planningApi.getMyTransportWeekPlan(this.weekStartDate),
        })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ({ templates, plan }) => {
                    this.templates = templates;
                    this.goTemplates = templates.filter((t) => t.direction === 'GO');
                    this.returnTemplates = templates.filter(
                        (t) => t.direction === 'RETURN'
                    );

                    // Update form with loaded data
                    const daysArray = this.form.get('days') as FormArray;
                    plan.entries.forEach((entry) => {
                        const dayIndex = this.weekDays.findIndex(
                            (d) => d.isoDate === entry.date
                        );
                        if (dayIndex >= 0) {
                            const dayGroup = daysArray.at(dayIndex) as FormGroup;
                            if (entry.direction === 'GO') {
                                dayGroup.patchValue({ goTemplateId: entry.templateId });
                            } else {
                                dayGroup.patchValue({
                                    returnTemplateId: entry.templateId,
                                });
                            }
                        }
                    });

                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading transport plan:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    getDaysArray(): FormArray {
        return this.form.get('days') as FormArray;
    }

    getAvailableTemplates(dayOfWeek: number, direction: TransportDirection): TransportTemplateDto[] {
        const templateList = direction === 'GO' ? this.goTemplates : this.returnTemplates;
        return templateList.filter((t) => t.daysOfWeek.includes(dayOfWeek));
    }

    onSave(): void {
        if (this.form.invalid || !this.isWindowOpen) {
            return;
        }

        this.isSaving = true;
        this.showSuccessAlert = false;
        this.showErrorAlert = false;

        const daysArray = this.form.get('days') as FormArray;
        const entries: {
            templateId: string;
            date: string;
            direction: TransportDirection;
        }[] = [];

        daysArray.controls.forEach((dayGroup) => {
            const value = dayGroup.value;
            if (value.goTemplateId) {
                entries.push({
                    templateId: value.goTemplateId,
                    date: value.date,
                    direction: 'GO',
                });
            }
            if (value.returnTemplateId) {
                entries.push({
                    templateId: value.returnTemplateId,
                    date: value.date,
                    direction: 'RETURN',
                });
            }
        });

        const payload = { entries };

        this._planningApi
            .saveTransportWeekPlan(payload)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.showSuccessAlert = true;
                    this.showErrorAlert = false;
                    this._changeDetectorRef.markForCheck();

                    // Hide success alert after 3 seconds
                    setTimeout(() => {
                        this.showSuccessAlert = false;
                        this._changeDetectorRef.markForCheck();
                    }, 3000);
                },
                error: (error) => {
                    console.error('Error saving transport plan:', error);
                    this.isSaving = false;
                    this.showErrorAlert = true;
                    this.showSuccessAlert = false;
                    this.errorMessage =
                        this._translocoService.translate('PLANNING.SAVE_ERROR');
                    this._changeDetectorRef.markForCheck();
                },
            });
    }
}
