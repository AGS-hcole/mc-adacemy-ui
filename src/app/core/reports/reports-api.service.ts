import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {
    SessionsListDto,
    SessionsSummaryDto,
    SessionsTimeseriesDto,
    UsersLookupDto,
} from './reports.types';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
    private apiUrl = environment.apiUrl;

    constructor(private _httpClient: HttpClient) {}

    /**
     * Get sessions summary
     */
    getSummary(
        from: string,
        to: string,
        userId?: string,
        contractScope?: string
    ): Observable<SessionsSummaryDto> {
        let params = new HttpParams()
            .set('from', from)
            .set('to', to);

        if (userId) {
            params = params.set('userId', userId);
        }
        if (contractScope && contractScope !== 'all') {
            params = params.set('contractScope', contractScope);
        }

        return this._httpClient.get<SessionsSummaryDto>(
            `${this.apiUrl}/v1/reports/sessions/summary`,
            { params }
        );
    }

    /**
     * Get sessions timeseries
     */
    getTimeseries(
        from: string,
        to: string,
        userId?: string,
        contractScope?: string,
        bucket: string = 'daily'
    ): Observable<SessionsTimeseriesDto> {
        let params = new HttpParams()
            .set('from', from)
            .set('to', to)
            .set('bucket', bucket);

        if (userId) {
            params = params.set('userId', userId);
        }
        if (contractScope && contractScope !== 'all') {
            params = params.set('contractScope', contractScope);
        }

        return this._httpClient.get<SessionsTimeseriesDto>(
            `${this.apiUrl}/v1/reports/sessions/timeseries`,
            { params }
        );
    }

    /**
     * Get sessions list
     */
    getSessionsList(
        from: string,
        to: string,
        page: number,
        pageSize: number,
        sort: string,
        userId?: string,
        contractScope?: string
    ): Observable<SessionsListDto> {
        let params = new HttpParams()
            .set('from', from)
            .set('to', to)
            .set('page', page.toString())
            .set('pageSize', pageSize.toString())
            .set('sort', sort);

        if (userId) {
            params = params.set('userId', userId);
        }
        if (contractScope && contractScope !== 'all') {
            params = params.set('contractScope', contractScope);
        }

        return this._httpClient.get<SessionsListDto>(
            `${this.apiUrl}/v1/reports/sessions/list`,
            { params }
        );
    }

    /**
     * Lookup users by role
     */
    lookupUsers(
        role: string = 'academician',
        search: string = '',
        page: number = 1,
        pageSize: number = 20
    ): Observable<UsersLookupDto> {
        let params = new HttpParams()
            .set('role', role)
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this._httpClient.get<UsersLookupDto>(
            `${this.apiUrl}/v1/users/lookup`,
            { params }
        );
    }
}
