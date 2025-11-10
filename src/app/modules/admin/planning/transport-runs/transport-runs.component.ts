import { NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { PlanningApi } from 'app/core/api/planning.api';
import { TransportRunDto } from 'app/core/models/planning';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-transport-runs',
    templateUrl: './transport-runs.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        NgFor,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslocoModule,
    ],
})
export class TransportRunsComponent implements OnInit, OnDestroy {
    runs: TransportRunDto[] = [];
    isLoading = true;
    isGenerating = false;
    weekStartDate: string;
    weekEndDate: string;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _planningApi: PlanningApi,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this._computeNextWeek();
        this._loadRuns();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _computeNextWeek(): void {
        const now = DateTime.now().setZone('Europe/Paris');
        const nextMonday = now.plus({ weeks: 1 }).startOf('week');
        const nextSunday = nextMonday.endOf('week');

        this.weekStartDate = nextMonday.toISODate();
        this.weekEndDate = nextSunday.toISODate();
    }

    private _loadRuns(): void {
        this.isLoading = true;
        this._planningApi
            .listRuns({ from: this.weekStartDate, to: this.weekEndDate })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (runs) => {
                    this.runs = runs;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading runs:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    onGenerate(): void {
        this.isGenerating = true;
        this._planningApi
            .generateRunsForWeek(this.weekStartDate)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isGenerating = false;
                    this._loadRuns();
                },
                error: (error) => {
                    console.error('Error generating runs:', error);
                    this.isGenerating = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    getStatusLabel(status: string): string {
        return `RUNS.STATUS_${status}`;
    }

    formatTime(isoString: string): string {
        return DateTime.fromISO(isoString, { zone: 'Europe/Paris' }).toFormat('HH:mm');
    }

    formatDate(dateString: string): string {
        return DateTime.fromISO(dateString, { zone: 'Europe/Paris' }).toFormat(
            'EEEE d MMMM',
            { locale: 'fr' }
        );
    }
}
