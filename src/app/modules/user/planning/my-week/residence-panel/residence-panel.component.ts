import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseAlertComponent } from '@fuse/components/alert';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PlanningApi } from 'app/core/api/planning.api';
import { ResidenceWeekPlanDto } from 'app/core/models/planning';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user-residence-planning-panel',
    templateUrl: './residence-panel.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        FuseAlertComponent,
    ],
})
export class ResidencePlanningPanelComponent implements OnInit, OnDestroy {
    form: FormGroup;
    weekDays: { date: string; label: string; isoDate: string }[] = [];
    weekStartDate: string;
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
        const nightsControls = {};
        this.weekDays.forEach((day) => {
            nightsControls[day.isoDate] = [false];
        });

        this.form = this._formBuilder.group({
            nights: this._formBuilder.group(nightsControls),
        });

        if (!this.isWindowOpen) {
            this.form.disable();
        }
    }

    private _loadData(): void {
        this.isLoading = true;
        this._planningApi
            .getMyResidenceWeekPlan(this.weekStartDate)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (plan: ResidenceWeekPlanDto) => {
                    // Update form with loaded data
                    const nightsGroup = this.form.get('nights') as FormGroup;
                    plan.nights.forEach((night) => {
                        const control = nightsGroup.get(night.date);
                        if (control) {
                            // User can only edit non-confirmed nights during window
                            control.setValue(night.confirmedPresent || false);
                            if (night.confirmedPresent) {
                                control.disable();
                            }
                        }
                    });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading residence plan:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    onSave(): void {
        if (this.form.invalid || !this.isWindowOpen) {
            return;
        }

        this.isSaving = true;
        this.showSuccessAlert = false;
        this.showErrorAlert = false;

        const nightsGroup = this.form.get('nights') as FormGroup;
        const selectedNights: string[] = [];

        Object.keys(nightsGroup.controls).forEach((date) => {
            if (nightsGroup.get(date)?.value === true) {
                selectedNights.push(date);
            }
        });

        const payload = {
            nights: selectedNights,
        };

        this._planningApi
            .saveResidenceWeekPlan(payload)
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
                    console.error('Error saving residence plan:', error);
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
