import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {
    UserSessionFeedResponse,
} from '../models/user-session-feed.types';

/**
 * Service for managing user session feed data
 */
@Injectable({ providedIn: 'root' })
export class UserSessionFeedService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    /**
     * Get session feed for the current user
     */
    getMySessionsFeed(params: {
        cursor?: string;
        limit?: number;
        direction?: 'past' | 'all';
    }): Observable<UserSessionFeedResponse> {
        let httpParams = new HttpParams();
        
        if (params.cursor) {
            httpParams = httpParams.set('cursor', params.cursor);
        }
        if (params.limit) {
            httpParams = httpParams.set('limit', params.limit.toString());
        }
        if (params.direction) {
            httpParams = httpParams.set('direction', params.direction);
        }

        return this.http.get<UserSessionFeedResponse>(
            `${this.apiUrl}/me/sessions/feed`,
            { params: httpParams }
        );
    }

    /**
     * Get session feed for a specific user
     */
    getUserSessionsFeed(
        userId: string,
        params: {
            cursor?: string;
            limit?: number;
            direction?: 'past' | 'all';
        }
    ): Observable<UserSessionFeedResponse> {
        let httpParams = new HttpParams();
        
        if (params.cursor) {
            httpParams = httpParams.set('cursor', params.cursor);
        }
        if (params.limit) {
            httpParams = httpParams.set('limit', params.limit.toString());
        }
        if (params.direction) {
            httpParams = httpParams.set('direction', params.direction);
        }

        return this.http.get<UserSessionFeedResponse>(
            `${this.apiUrl}/users/${userId}/sessions/feed`,
            { params: httpParams }
        );
    }
}
