import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import {
    BehaviorSubject,
    Observable,
    catchError,
    tap,
    throwError,
} from 'rxjs';
import { AdminDashboardDto } from '../models/admin-dashboard.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
    private apiUrl = environment.apiUrl;
    private cache = new Map<string, AdminDashboardDto>();
    private _loading = new BehaviorSubject<boolean>(false);
    private _error = new BehaviorSubject<string | null>(null);
    private _currentData = new BehaviorSubject<AdminDashboardDto | null>(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for loading state
     */
    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    /**
     * Getter for error state
     */
    get error$(): Observable<string | null> {
        return this._error.asObservable();
    }

    /**
     * Getter for current data
     */
    get data$(): Observable<AdminDashboardDto | null> {
        return this._currentData.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get dashboard data for a specific date
     * Uses cache if available, unless forceRefresh is true
     */
    getDashboard(
        date?: string,
        forceRefresh = false
    ): Observable<AdminDashboardDto> {
        const dateKey = date || this.getTodayString();

        // Check cache
        if (!forceRefresh && this.cache.has(dateKey)) {
            const cached = this.cache.get(dateKey)!;
            this._currentData.next(cached);
            return new Observable((observer) => {
                observer.next(cached);
                observer.complete();
            });
        }

        // Build URL
        const url = date
            ? `${this.apiUrl}/admin/dashboard?date=${encodeURIComponent(date)}`
            : `${this.apiUrl}/admin/dashboard`;

        this._loading.next(true);
        this._error.next(null);

        return this._httpClient.get<AdminDashboardDto>(url).pipe(
            tap((data) => {
                this.cache.set(dateKey, data);
                this._currentData.next(data);
                this._loading.next(false);
            }),
            catchError((error) => {
                this._loading.next(false);
                const errorMessage = this._handleError(error);
                this._error.next(errorMessage);
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Refresh dashboard data for a specific date (force reload from API)
     */
    refresh(date?: string): Observable<AdminDashboardDto> {
        const dateKey = date || this.getTodayString();
        this.cache.delete(dateKey);
        return this.getDashboard(date, true);
    }

    /**
     * Clear all cached data
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Update local cache with modified data (for optimistic updates)
     */
    updateCache(date: string, data: AdminDashboardDto): void {
        this.cache.set(date, data);
        this._currentData.next(data);
    }

    /**
     * Get today's date in YYYY-MM-DD format (Europe/Paris timezone)
     */
    private getTodayString(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Handle HTTP errors
     */
    private _handleError(error: HttpErrorResponse): string {
        let errorMessage = 'An error occurred while loading dashboard data';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            if (error.status === 404) {
                errorMessage = 'Dashboard data not found';
            } else if (error.status === 403) {
                errorMessage = 'Access denied';
            } else if (error.status === 500) {
                errorMessage = 'Server error occurred';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            }
        }

        console.error('AdminDashboardService Error:', errorMessage, error);
        return errorMessage;
    }
}
