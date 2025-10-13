import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { ReportsExportService } from 'app/core/reports/reports-export.service';
import { ReportsStateService } from 'app/core/reports/reports-state.service';
import {
    ReportsFilters,
    SessionListItem,
    SessionsListDto,
    SessionsSummaryDto,
    SessionsTimeseriesDto,
} from 'app/core/reports/reports.types';
import { ReportsContractShareChartComponent } from './reports-contract-share-chart.component';
import { ReportsFiltersComponent } from './reports-filters.component';
import { ReportsKpiCardsComponent } from './reports-kpi-cards.component';
import { ReportsTableComponent } from './reports-table.component';
import { ReportsTimeseriesChartComponent } from './reports-timeseries-chart.component';

@Component({
    selector: 'reports-dashboard',
    templateUrl: './reports-dashboard.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        TranslocoModule,
        ReportsFiltersComponent,
        ReportsKpiCardsComponent,
        ReportsTimeseriesChartComponent,
        ReportsContractShareChartComponent,
        ReportsTableComponent,
    ],
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
    filters!: ReportsFilters;
    summary: SessionsSummaryDto | null = null;
    timeseries: SessionsTimeseriesDto | null = null;
    sessionsList: SessionsListDto | null = null;
    loading = false;
    error: string | null = null;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _state: ReportsStateService,
        private _export: ReportsExportService
    ) {}

    ngOnInit(): void {
        // Initialize from query params
        this._route.queryParams
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((queryParams) => {
                this._state.initializeFromQueryParams(queryParams);
            });

        // Subscribe to state changes
        this._state.filters$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((filters) => {
                this.filters = filters;
            });

        this._state.summary$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summary) => {
                this.summary = summary;
            });

        this._state.timeseries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((timeseries) => {
                this.timeseries = timeseries;
            });

        this._state.sessionsList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((sessionsList) => {
                this.sessionsList = sessionsList;
            });

        this._state.loading$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((loading) => {
                this.loading = loading;
            });

        this._state.error$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((error) => {
                this.error = error;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * Handle filters change
     */
    onFiltersChange(partial: Partial<ReportsFilters>): void {
        this._state.updateFilters(partial);
    }

    /**
     * Handle apply filters
     */
    onApplyFilters(): void {
        this._state.loadData();
    }

    /**
     * Handle reset filters
     */
    onResetFilters(): void {
        this._state.resetFilters();
        this._state.loadData();
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this._state.updateFilters({
            page: event.pageIndex + 1,
            pageSize: event.pageSize,
        });
        this._state.loadData();
    }

    /**
     * View session
     */
    onViewSession(sessionId: string): void {
        this._router.navigate(['/admin/sessions', sessionId]);
    }

    /**
     * Export CSV
     */
    exportCsv(): void {
        if (this.sessionsList && this.sessionsList.items.length > 0) {
            this._export.exportCsv(this.sessionsList.items);
        }
    }

    /**
     * Export JSON
     */
    exportJson(): void {
        if (this.sessionsList && this.sessionsList.items.length > 0) {
            this._export.exportJson(this.sessionsList.items);
        }
    }

    /**
     * Retry loading data
     */
    retry(): void {
        this._state.reload();
    }
}
