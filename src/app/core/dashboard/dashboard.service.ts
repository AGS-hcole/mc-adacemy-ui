import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, forkJoin, map, tap } from 'rxjs';
import { DashboardStats } from './dashboard.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private apiUrl = environment.apiUrl;
    private _stats: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for stats
     */
    get stats$(): Observable<any> {
        return this._stats.asObservable();
    }

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
                const admins = users.filter((u) => u.role === 'admin').length;
                const students = users.filter((u) => u.role === 'user').length;

                const now = new Date();
                const upcoming = sessions.filter((s) => {
                    const sessionDate = new Date(s.date);
                    return (
                        s.isPublished === true &&
                        s.isCanceled === false &&
                        sessionDate >= now
                    );
                }).length;

                const stats: DashboardStats = {
                    sites: { total: sites.length },
                    users: { total: users.length, admins, students },
                    sessions: { total: sessions.length, upcoming },
                    tournaments: { total: 0, upcoming: 0 },
                };

                return stats;
            }),
            tap((stats) => this._stats.next(stats))
        );
    }
}
