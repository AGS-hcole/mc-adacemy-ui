import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import {
    Rating,
    SessionRatingsResponse,
    UpsertRatingRequest,
} from './session.types';

@Injectable({ providedIn: 'root' })
export class RatingsService {
    private apiUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Upsert (create or update) a rating for a participant in a session
     */
    upsert(
        sessionId: string,
        userId: string,
        dto: UpsertRatingRequest
    ): Observable<Rating> {
        return this._httpClient
            .put<Rating>(
                `${this.apiUrl}/sessions/${sessionId}/ratings/${userId}`,
                dto
            )
            .pipe(catchError(this._handleError));
    }

    /**
     * Get all ratings for a session with statistics
     */
    getForSession(sessionId: string): Observable<SessionRatingsResponse> {
        return this._httpClient
            .get<SessionRatingsResponse>(
                `${this.apiUrl}/sessions/${sessionId}/ratings`
            )
            .pipe(catchError(this._handleError));
    }

    /**
     * Delete a rating for a participant in a session
     */
    delete(sessionId: string, userId: string): Observable<void> {
        return this._httpClient
            .delete<void>(
                `${this.apiUrl}/sessions/${sessionId}/ratings/${userId}`
            )
            .pipe(catchError(this._handleError));
    }

    /**
     * Get all ratings for a user with optional date range
     */
    getForUser(
        userId: string,
        from?: string,
        to?: string
    ): Observable<Rating[]> {
        let url = `${this.apiUrl}/users/${userId}/ratings`;
        const params: string[] = [];

        if (from) {
            params.push(`from=${encodeURIComponent(from)}`);
        }
        if (to) {
            params.push(`to=${encodeURIComponent(to)}`);
        }

        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        return this._httpClient
            .get<Rating[]>(url)
            .pipe(catchError(this._handleError));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Handle HTTP errors
     */
    private _handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.error?.message) {
                errorMessage = error.error.message;
            }
        }

        console.error('RatingsService Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
