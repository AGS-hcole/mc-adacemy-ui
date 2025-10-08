import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';
import {
    AdminRegisterRequest,
    CreateSessionRequest,
    Session,
    SessionFilters,
    Site,
    UpdateSessionRequest,
} from './session.types';

@Injectable({ providedIn: 'root' })
export class SessionsService {
    private apiUrl = environment.apiUrl;
    private _session: BehaviorSubject<Session | null> = new BehaviorSubject(
        null
    );
    private _sessions: BehaviorSubject<Session[] | null> = new BehaviorSubject(
        null
    );
    private _sites: BehaviorSubject<Site[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for session
     */
    get session$(): Observable<Session> {
        return this._session.asObservable();
    }

    /**
     * Getter for sessions
     */
    get sessions$(): Observable<Session[]> {
        return this._sessions.asObservable();
    }

    /**
     * Getter for sites
     */
    get sites$(): Observable<Site[]> {
        return this._sites.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all sessions with optional filters
     */
    getSessions(filters?: SessionFilters): Observable<Session[]> {
        let params = new HttpParams();

        if (filters) {
            if (filters.siteId) {
                params = params.set('siteId', filters.siteId);
            }
            if (filters.startDate) {
                params = params.set('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params = params.set('endDate', filters.endDate);
            }
            if (filters.slot) {
                params = params.set('slot', filters.slot);
            }
            if (
                filters.isPublished !== null &&
                filters.isPublished !== undefined
            ) {
                params = params.set('isPublished', String(filters.isPublished));
            }
            if (
                filters.isCanceled !== null &&
                filters.isCanceled !== undefined
            ) {
                params = params.set('isCanceled', String(filters.isCanceled));
            }
        }

        return this._httpClient
            .get<Session[]>(`${this.apiUrl}/sessions`, { params })
            .pipe(
                tap((sessions) => {
                    this._sessions.next(sessions);
                })
            );
    }

    /**
     * Get upcoming sessions (published, not cancelled, future dates)
     */
    getUpcomingSessions(): Observable<Session[]> {
        return this._httpClient
            .get<Session[]>(`${this.apiUrl}/sessions/upcoming`)
            .pipe(
                tap((sessions) => {
                    this._sessions.next(sessions);
                })
            );
    }

    /**
     * Get session by id
     */
    getSessionById(id: string): Observable<Session> {
        return this._httpClient
            .get<Session>(`${this.apiUrl}/sessions/${id}`)
            .pipe(
                tap((session) => {
                    this._session.next(session);
                })
            );
    }

    /**
     * Create session
     */
    createSession(request: CreateSessionRequest): Observable<Session> {
        return this._sessions.pipe(
            take(1),
            switchMap((sessions) =>
                this._httpClient
                    .post<Session>(`${this.apiUrl}/sessions`, request)
                    .pipe(
                        map((newSession) => {
                            // Update the sessions with the new session
                            const updatedSessions = sessions || [];
                            this._sessions.next([
                                newSession,
                                ...updatedSessions,
                            ]);
                            return newSession;
                        })
                    )
            )
        );
    }

    /**
     * Update session
     */
    updateSession(
        id: string,
        request: UpdateSessionRequest
    ): Observable<Session> {
        return this._sessions.pipe(
            take(1),
            switchMap((sessions) =>
                this._httpClient
                    .put<Session>(`${this.apiUrl}/sessions/${id}`, request)
                    .pipe(
                        map((updatedSession) => {
                            if (sessions) {
                                // Find the index of the updated session
                                const index = sessions.findIndex(
                                    (item) => item.id === id
                                );

                                if (index !== -1) {
                                    // Update the session
                                    sessions[index] = updatedSession;
                                    this._sessions.next([...sessions]);
                                }
                            }

                            // Update the current session if it matches
                            const currentSession = this._session.getValue();
                            if (currentSession && currentSession.id === id) {
                                this._session.next(updatedSession);
                            }

                            return updatedSession;
                        })
                    )
            )
        );
    }

    /**
     * Delete session
     */
    deleteSession(id: string): Observable<boolean> {
        return this._sessions.pipe(
            take(1),
            switchMap((sessions) =>
                this._httpClient
                    .delete<void>(`${this.apiUrl}/sessions/${id}`)
                    .pipe(
                        map(() => {
                            if (sessions) {
                                // Find the index of the deleted session
                                const index = sessions.findIndex(
                                    (item) => item.id === id
                                );

                                if (index !== -1) {
                                    sessions.splice(index, 1);
                                    this._sessions.next([...sessions]);
                                }
                            }

                            return true;
                        })
                    )
            )
        );
    }

    /**
     * Admin register a user to a session (override)
     */
    adminRegisterUser(request: AdminRegisterRequest): Observable<Session> {
        return this._httpClient
            .post<Session>(
                `${this.apiUrl}/sessions/${request.sessionId}/admin-register`,
                { userId: request.userId }
            )
            .pipe(
                tap((updatedSession) => {
                    // Update the session in the list
                    const sessions = this._sessions.getValue();
                    if (sessions) {
                        const index = sessions.findIndex(
                            (s) => s.id === request.sessionId
                        );
                        if (index !== -1) {
                            sessions[index] = updatedSession;
                            this._sessions.next([...sessions]);
                        }
                    }

                    // Update the current session if it matches
                    const currentSession = this._session.getValue();
                    if (
                        currentSession &&
                        currentSession.id === request.sessionId
                    ) {
                        this._session.next(updatedSession);
                    }
                })
            );
    }

    /**
     * Get all sites
     */
    getSites(): Observable<Site[]> {
        return this._httpClient.get<Site[]>(`${this.apiUrl}/sites`).pipe(
            tap((sites) => {
                this._sites.next(sites);
            })
        );
    }

    /**
     * Reset the session observable
     */
    resetSession(): void {
        this._session.next(null);
    }
}
