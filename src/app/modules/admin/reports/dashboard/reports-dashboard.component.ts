import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReportsStateService } from 'app/core/reports/reports-state.service';
import {
    RatingsSummaryDto,
    ResidenceListDto,
    ResidenceSummaryDto,
    ResidenceTimeseriesDto,
    ReportsFilters,
    SessionsListDto,
    SessionsSummaryDto,
    SessionsTimeseriesDto,
    TransportsListDto,
    TransportsSummaryDto,
    TransportsTimeseriesDto,
} from 'app/core/reports/reports.types';
import { Subject, takeUntil } from 'rxjs';
import { ReportsContractShareChartComponent } from './reports-contract-share-chart.component';
import { ReportsFiltersComponent } from './reports-filters.component';
import { ReportsKpiCardsComponent } from './reports-kpi-cards.component';
import { ReportsRatingsSectionComponent } from './reports-ratings-section.component';
import { ReportsResidenceTableComponent } from './reports-residence-table.component';
import { ReportsResidenceTimeseriesChartComponent } from './reports-residence-timeseries-chart.component';
import { ReportsTableComponent } from './reports-table.component';
import { ReportsTransportsTableComponent } from './reports-transports-table.component';
import { ReportsTransportsTimeseriesChartComponent } from './reports-transports-timeseries-chart.component';
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
        ReportsRatingsSectionComponent,
        ReportsResidenceTableComponent,
        ReportsResidenceTimeseriesChartComponent,
        ReportsTableComponent,
        ReportsTransportsTableComponent,
        ReportsTransportsTimeseriesChartComponent,
    ],
})
export class ReportsDashboardComponent implements OnInit, OnChanges, OnDestroy {
    @Input() lockedUserId?: string;

    filters!: ReportsFilters;
    summary: SessionsSummaryDto | null = null;
    timeseries: SessionsTimeseriesDto | null = null;
    sessionsList: SessionsListDto | null = null;
    ratingsSummary: RatingsSummaryDto | null = null;
    residenceSummary: ResidenceSummaryDto | null = null;
    residenceTimeseries: ResidenceTimeseriesDto | null = null;
    residenceList: ResidenceListDto | null = null;
    transportsSummary: TransportsSummaryDto | null = null;
    transportsTimeseries: TransportsTimeseriesDto | null = null;
    transportsList: TransportsListDto | null = null;
    loading = false;
    error: string | null = null;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _state: ReportsStateService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Initialize from query params
        this._route.queryParams
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((queryParams) => {
                // Merge locked userId into params before initialization
                const effectiveParams = this.lockedUserId
                    ? { ...queryParams, userId: this.lockedUserId }
                    : queryParams;
                this._state.initializeFromQueryParams(effectiveParams);
            });

        // Subscribe to state changes
        this._state.filters$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((filters) => {
                this.filters = filters;

                // Mark for check (needed when this component is nested under
                // an OnPush ancestor, e.g. the parent reports page)
                this._changeDetectorRef.markForCheck();
            });

        this._state.summary$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summary) => {
                this.summary = summary;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._state.timeseries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((timeseries) => {
                this.timeseries = timeseries;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._state.sessionsList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((sessionsList) => {
                this.sessionsList = sessionsList;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._state.ratingsSummary$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((ratingsSummary) => {
                this.ratingsSummary = ratingsSummary;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._state.residenceSummary$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((residenceSummary) => {
                this.residenceSummary = residenceSummary;
                this._changeDetectorRef.markForCheck();
            });

        this._state.residenceTimeseries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((residenceTimeseries) => {
                this.residenceTimeseries = residenceTimeseries;
                this._changeDetectorRef.markForCheck();
            });

        this._state.residenceList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((residenceList) => {
                this.residenceList = residenceList;
                this._changeDetectorRef.markForCheck();
            });

        this._state.transportsSummary$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transportsSummary) => {
                this.transportsSummary = transportsSummary;
                this._changeDetectorRef.markForCheck();
            });

        this._state.transportsTimeseries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transportsTimeseries) => {
                this.transportsTimeseries = transportsTimeseries;
                this._changeDetectorRef.markForCheck();
            });

        this._state.transportsList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transportsList) => {
                this.transportsList = transportsList;
                this._changeDetectorRef.markForCheck();
            });

        this._state.loading$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((loading) => {
                this.loading = loading;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._state.error$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((error) => {
                this.error = error;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * React to a change of the locked user id (e.g. parent switching between children)
     */
    ngOnChanges(changes: SimpleChanges): void {
        const change = changes.lockedUserId;

        // Skip the first change, which is already handled by the query params
        // initialization in ngOnInit
        if (!change || change.firstChange) {
            return;
        }

        if (change.currentValue === change.previousValue) {
            return;
        }

        this._state.updateFilters({
            userId: this.lockedUserId,
            page: 1,
        });
        this._state.loadData();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle filters change
     */
    onFiltersChange(partial: Partial<ReportsFilters>): void {
        // Prevent overriding a locked userId
        if (this.lockedUserId) {
            partial = { ...partial, userId: this.lockedUserId };
        }
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
     * Retry loading data
     */
    retry(): void {
        this._state.reload();
    }
}
