import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, Subject, combineLatest, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs';
import { ReportsApiService } from './reports-api.service';
import {
    ContractScope,
    PeriodPreset,
    ReportsFilters,
    SessionsListDto,
    SessionsSummaryDto,
    SessionsTimeseriesDto,
} from './reports.types';

const STORAGE_KEY = 'mca-reports-filters-v1';
const TIMEZONE = 'Europe/Paris';

@Injectable({ providedIn: 'root' })
export class ReportsStateService {
    private _filters$ = new BehaviorSubject<ReportsFilters>(this.getDefaultFilters());
    private _summary$ = new BehaviorSubject<SessionsSummaryDto | null>(null);
    private _timeseries$ = new BehaviorSubject<SessionsTimeseriesDto | null>(null);
    private _sessionsList$ = new BehaviorSubject<SessionsListDto | null>(null);
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _error$ = new BehaviorSubject<string | null>(null);
    private _cancelRequests$ = new Subject<void>();

    constructor(
        private _router: Router,
        private _api: ReportsApiService
    ) {
        this.initializeFiltersListener();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get filters$(): Observable<ReportsFilters> {
        return this._filters$.asObservable();
    }

    get summary$(): Observable<SessionsSummaryDto | null> {
        return this._summary$.asObservable();
    }

    get timeseries$(): Observable<SessionsTimeseriesDto | null> {
        return this._timeseries$.asObservable();
    }

    get sessionsList$(): Observable<SessionsListDto | null> {
        return this._sessionsList$.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading$.asObservable();
    }

    get error$(): Observable<string | null> {
        return this._error$.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize filters from query params or localStorage
     */
    initializeFromQueryParams(queryParams: any): void {
        const filters = this.getFiltersFromQueryParams(queryParams);
        this._filters$.next(filters);
        this.loadData();
    }

    /**
     * Update filters
     */
    updateFilters(partial: Partial<ReportsFilters>): void {
        const currentFilters = this._filters$.value;
        const newFilters = { ...currentFilters, ...partial };
        this._filters$.next(newFilters);
    }

    /**
     * Reset filters to default
     */
    resetFilters(): void {
        const defaultFilters = this.getDefaultFilters();
        this._filters$.next(defaultFilters);
    }

    /**
     * Load all data (summary, timeseries, list)
     */
    loadData(): void {
        this._cancelRequests$.next();
        this._loading$.next(true);
        this._error$.next(null);

        const filters = this._filters$.value;

        combineLatest([
            this._api.getSummary(filters.from, filters.to, filters.userId, filters.contractScope),
            this._api.getTimeseries(filters.from, filters.to, filters.userId, filters.contractScope),
            this._api.getSessionsList(
                filters.from,
                filters.to,
                filters.page,
                filters.pageSize,
                filters.sort,
                filters.userId,
                filters.contractScope
            ),
        ])
            .pipe(takeUntil(this._cancelRequests$))
            .subscribe({
                next: ([summary, timeseries, sessionsList]) => {
                    this._summary$.next(summary);
                    this._timeseries$.next(timeseries);
                    this._sessionsList$.next(sessionsList);
                    this._loading$.next(false);
                },
                error: (error) => {
                    console.error('Error loading reports data:', error);
                    this._error$.next(error.message || 'An error occurred while loading data');
                    this._loading$.next(false);
                },
            });
    }

    /**
     * Reload data (with current filters)
     */
    reload(): void {
        this.loadData();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize listener for filter changes
     */
    private initializeFiltersListener(): void {
        this._filters$
            .pipe(
                debounceTime(300),
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                tap((filters) => {
                    this.persistFilters(filters);
                    this.updateQueryParams(filters);
                })
            )
            .subscribe();
    }

    /**
     * Get default filters
     */
    private getDefaultFilters(): ReportsFilters {
        const now = DateTime.now().setZone(TIMEZONE);
        const sevenDaysAgo = now.minus({ days: 7 });

        return {
            from: sevenDaysAgo.toISODate()!,
            to: now.toISODate()!,
            userId: undefined,
            contractScope: 'all',
            preset: 'last7',
            page: 1,
            pageSize: 25,
            sort: 'date:desc',
        };
    }

    /**
     * Get filters from query params, with fallback to localStorage or defaults
     */
    private getFiltersFromQueryParams(queryParams: any): ReportsFilters {
        const storedFilters = this.getStoredFilters();
        const defaultFilters = this.getDefaultFilters();

        const preset = (queryParams.preset as PeriodPreset) || storedFilters?.preset || defaultFilters.preset;
        let from: string;
        let to: string;

        if (preset === 'custom' && queryParams.from && queryParams.to) {
            from = queryParams.from;
            to = queryParams.to;
        } else if (storedFilters && storedFilters.preset === preset) {
            from = storedFilters.from;
            to = storedFilters.to;
        } else {
            const dates = this.getDateRangeFromPreset(preset);
            from = dates.from;
            to = dates.to;
        }

        return {
            from,
            to,
            userId: queryParams.userId || storedFilters?.userId || undefined,
            contractScope: (queryParams.contractScope as ContractScope) || storedFilters?.contractScope || defaultFilters.contractScope,
            preset,
            page: parseInt(queryParams.page) || storedFilters?.page || defaultFilters.page,
            pageSize: parseInt(queryParams.pageSize) || storedFilters?.pageSize || defaultFilters.pageSize,
            sort: queryParams.sort || storedFilters?.sort || defaultFilters.sort,
        };
    }

    /**
     * Get date range from preset
     */
    private getDateRangeFromPreset(preset: PeriodPreset): { from: string; to: string } {
        const now = DateTime.now().setZone(TIMEZONE);

        switch (preset) {
            case 'last7':
                return {
                    from: now.minus({ days: 7 }).toISODate()!,
                    to: now.toISODate()!,
                };
            case 'last30':
                return {
                    from: now.minus({ days: 30 }).toISODate()!,
                    to: now.toISODate()!,
                };
            case 'thisMonth':
                return {
                    from: now.startOf('month').toISODate()!,
                    to: now.toISODate()!,
                };
            case 'prevMonth':
                const prevMonth = now.minus({ months: 1 });
                return {
                    from: prevMonth.startOf('month').toISODate()!,
                    to: prevMonth.endOf('month').toISODate()!,
                };
            case 'custom':
            default:
                return {
                    from: now.minus({ days: 7 }).toISODate()!,
                    to: now.toISODate()!,
                };
        }
    }

    /**
     * Persist filters to localStorage
     */
    private persistFilters(filters: ReportsFilters): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
        } catch (error) {
            console.warn('Failed to persist filters to localStorage:', error);
        }
    }

    /**
     * Get stored filters from localStorage
     */
    private getStoredFilters(): ReportsFilters | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('Failed to retrieve filters from localStorage:', error);
            return null;
        }
    }

    /**
     * Update query params
     */
    private updateQueryParams(filters: ReportsFilters): void {
        const queryParams: any = {
            preset: filters.preset,
            contractScope: filters.contractScope,
            page: filters.page,
            pageSize: filters.pageSize,
            sort: filters.sort,
        };

        if (filters.preset === 'custom') {
            queryParams.from = filters.from;
            queryParams.to = filters.to;
        }

        if (filters.userId) {
            queryParams.userId = filters.userId;
        }

        this._router.navigate([], {
            relativeTo: null,
            queryParams,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
}
