import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, forkJoin, map } from 'rxjs';
import { DashboardStats } from './dashboard.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private apiUrl = environment.apiUrl;

    constructor(private _httpClient: HttpClient) {}

    /**
     * Get dashboard statistics
     * This aggregates data from multiple endpoints
     */
    getDashboardStats(): Observable<DashboardStats> {
        return forkJoin({
            sites: this._httpClient.get<any[]>(`${this.apiUrl}/sites`),
            users: this._httpClient.get<any[]>(`${this.apiUrl}/users`),
            sessions: this._httpClient.get<any[]>(`${this.apiUrl}/sessions`),
        }).pipe(
            map(({ sites, users, sessions }) => {
                // Count admins and regular users
                const admins = users.filter((u) => u.role === 'admin').length;
                const regularUsers = users.filter((u) => u.role === 'user').length;

                // Count active sessions (published and not cancelled, future dates)
                const now = new Date();
                const activeSessions = sessions.filter((s) => {
                    const sessionDate = new Date(s.date);
                    return (
                        s.isPublished === true &&
                        s.isCanceled === false &&
                        sessionDate >= now
                    );
                }).length;

                return {
                    sites: {
                        total: sites.length,
                    },
                    users: {
                        total: users.length,
                        admins,
                        regularUsers,
                    },
                    sessions: {
                        active: activeSessions,
                    },
                    tournaments: {
                        // Tournaments feature is not yet implemented (disabled in navigation)
                        upcoming: 0,
                    },
                };
            })
        );
    }
}
