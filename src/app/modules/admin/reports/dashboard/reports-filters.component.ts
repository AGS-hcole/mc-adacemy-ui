import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';
import { DateTime } from 'luxon';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ReportsApiService } from 'app/core/reports/reports-api.service';
import { ContractScope, PeriodPreset, ReportsFilters, UserLookupItem } from 'app/core/reports/reports.types';

@Component({
    selector: 'reports-filters',
    templateUrl: './reports-filters.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        TranslocoModule,
    ],
})
export class ReportsFiltersComponent implements OnInit, OnDestroy {
    @Input() filters!: ReportsFilters;
    @Output() filtersChange = new EventEmitter<Partial<ReportsFilters>>();
    @Output() apply = new EventEmitter<void>();
    @Output() reset = new EventEmitter<void>();

    filtersForm!: FormGroup;
    users: UserLookupItem[] = [];
    loadingUsers = false;
    
    private _unsubscribeAll = new Subject<void>();

    presetOptions: { value: PeriodPreset; label: string }[] = [
        { value: 'last7', label: 'REPORTS.FILTERS.PRESET.LAST_7' },
        { value: 'last30', label: 'REPORTS.FILTERS.PRESET.LAST_30' },
        { value: 'thisMonth', label: 'REPORTS.FILTERS.PRESET.THIS_MONTH' },
        { value: 'prevMonth', label: 'REPORTS.FILTERS.PRESET.PREV_MONTH' },
        { value: 'custom', label: 'REPORTS.FILTERS.PRESET.CUSTOM' },
    ];

    contractScopeOptions: { value: ContractScope; label: string }[] = [
        { value: 'all', label: 'REPORTS.FILTERS.CONTRACT.ALL' },
        { value: 'under', label: 'REPORTS.FILTERS.CONTRACT.UNDER' },
        { value: 'off', label: 'REPORTS.FILTERS.CONTRACT.OFF' },
    ];

    constructor(
        private _fb: FormBuilder,
        private _api: ReportsApiService
    ) {}

    ngOnInit(): void {
        this.createForm();
        this.loadUsers();
        this.subscribeToPresetChanges();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * Create form
     */
    private createForm(): void {
        this.filtersForm = this._fb.group({
            preset: [this.filters.preset],
            dateFrom: [this.filters.from ? DateTime.fromISO(this.filters.from).toJSDate() : null],
            dateTo: [this.filters.to ? DateTime.fromISO(this.filters.to).toJSDate() : null],
            userId: [this.filters.userId],
            contractScope: [this.filters.contractScope],
        });
    }

    /**
     * Subscribe to preset changes
     */
    private subscribeToPresetChanges(): void {
        this.filtersForm.get('preset')!.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((preset: PeriodPreset) => {
                if (preset !== 'custom') {
                    const dates = this.getDateRangeFromPreset(preset);
                    this.filtersForm.patchValue({
                        dateFrom: dates.from,
                        dateTo: dates.to,
                    }, { emitEvent: false });
                }
            });
    }

    /**
     * Load users
     */
    private loadUsers(): void {
        this.loadingUsers = true;
        this._api.lookupUsers('academician', '', 1, 100)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.users = response.items;
                    this.loadingUsers = false;
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                    this.loadingUsers = false;
                },
            });
    }

    /**
     * Get date range from preset
     */
    private getDateRangeFromPreset(preset: PeriodPreset): { from: Date; to: Date } {
        const now = DateTime.now().setZone('Europe/Paris');

        switch (preset) {
            case 'last7':
                return {
                    from: now.minus({ days: 7 }).toJSDate(),
                    to: now.toJSDate(),
                };
            case 'last30':
                return {
                    from: now.minus({ days: 30 }).toJSDate(),
                    to: now.toJSDate(),
                };
            case 'thisMonth':
                return {
                    from: now.startOf('month').toJSDate(),
                    to: now.toJSDate(),
                };
            case 'prevMonth':
                const prevMonth = now.minus({ months: 1 });
                return {
                    from: prevMonth.startOf('month').toJSDate(),
                    to: prevMonth.endOf('month').toJSDate(),
                };
            default:
                return {
                    from: now.minus({ days: 7 }).toJSDate(),
                    to: now.toJSDate(),
                };
        }
    }

    /**
     * Apply filters
     */
    onApply(): void {
        const formValue = this.filtersForm.value;
        const filters: Partial<ReportsFilters> = {
            preset: formValue.preset,
            userId: formValue.userId || undefined,
            contractScope: formValue.contractScope,
        };

        if (formValue.dateFrom && formValue.dateTo) {
            filters.from = DateTime.fromJSDate(formValue.dateFrom).toISODate()!;
            filters.to = DateTime.fromJSDate(formValue.dateTo).toISODate()!;
        }

        this.filtersChange.emit(filters);
        this.apply.emit();
    }

    /**
     * Reset filters
     */
    onReset(): void {
        this.reset.emit();
    }

    /**
     * Check if custom dates are enabled
     */
    get isCustomPreset(): boolean {
        return this.filtersForm.get('preset')?.value === 'custom';
    }
}
