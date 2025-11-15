import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {
    SocialComment,
    SocialCommentPage,
    SocialLikeResponse,
    SocialTargetType,
} from '../models/social.types';
import { UserSessionFeedResponse } from '../models/user-session-feed.types';

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
            `${this.apiUrl}/users/me/sessions/feed`,
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

    /**
     * Toggle like for a given social target.
     * The caller decides whether we are liking or unliking based on current state.
     */
    toggleLike(
        targetType: SocialTargetType,
        entityId: string,
        like: boolean
    ): Observable<SocialLikeResponse> {
        const body = { targetType, entityId };

        if (like) {
            return this.http.post<SocialLikeResponse>(
                `${this.apiUrl}/social/likes`,
                body
            );
        } else {
            return this.http.delete<SocialLikeResponse>(
                `${this.apiUrl}/social/likes`,
                { body }
            );
        }
    }

    /**
     * Get comments for a given social target.
     */
    getComments(
        targetType: SocialTargetType,
        entityId: string,
        cursor?: string | null,
        limit: number = 20
    ): Observable<SocialCommentPage> {
        const params: any = {
            targetType,
            entityId,
            limit,
        };

        if (cursor) {
            params.cursor = cursor;
        }

        return this.http.get<SocialCommentPage>(
            `${this.apiUrl}/social/comments`,
            { params }
        );
    }

    /**
     * Add a comment on a given social target.
     */
    addComment(
        targetType: SocialTargetType,
        entityId: string,
        content: string,
        parentId?: string
    ): Observable<SocialComment> {
        const body: any = {
            targetType,
            entityId,
            content,
        };

        if (parentId) {
            body.parentId = parentId;
        }

        return this.http.post<SocialComment>(
            `${this.apiUrl}/social/comments`,
            body
        );
    }
}
