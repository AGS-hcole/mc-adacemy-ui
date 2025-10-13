import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import {
    CreateTournamentRequest,
    ReorderTeamsRequest,
    ReplaceParticipantsRequest,
    RsvpStatus,
    SetTeamPlacementRequest,
    Tournament,
    TournamentFeedbackRequest,
    TournamentFilters,
    TournamentRsvpRequest,
    UpdateTournamentRequest,
    UserLookupResult,
} from './tournament.types';

@Injectable({ providedIn: 'root' })
export class TournamentsService {
    // Private
    private apiUrl = environment.apiUrl;
    private _tournament: BehaviorSubject<Tournament | null> =
        new BehaviorSubject(null);
    private _tournaments: BehaviorSubject<Tournament[] | null> =
        new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tournament
     */
    get tournament$(): Observable<Tournament> {
        return this._tournament.asObservable();
    }

    /**
     * Getter for tournaments
     */
    get tournaments$(): Observable<Tournament[]> {
        return this._tournaments.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - Admin
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all tournaments with optional filters
     */
    list(filters?: TournamentFilters): Observable<Tournament[]> {
        let params = new HttpParams();

        if (filters) {
            if (filters.status) {
                params = params.set('status', filters.status);
            }
            if (filters.type) {
                params = params.set('type', filters.type);
            }
            if (filters.startDate) {
                params = params.set('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params = params.set('endDate', filters.endDate);
            }
            if (filters.search) {
                params = params.set('search', filters.search);
            }
        }

        return this._httpClient
            .get<Tournament[]>(`${this.apiUrl}/tournaments`, { params })
            .pipe(
                tap((tournaments) => {
                    this._tournaments.next(tournaments);
                })
            );
    }

    /**
     * Get tournament by id
     */
    getById(id: string): Observable<Tournament> {
        return this._httpClient
            .get<Tournament>(`${this.apiUrl}/tournaments/${id}`)
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Create tournament
     */
    create(payload: CreateTournamentRequest): Observable<Tournament> {
        return this._httpClient
            .post<Tournament>(`${this.apiUrl}/tournaments`, payload)
            .pipe(
                tap((tournament) => {
                    // Add to the list
                    const tournaments = this._tournaments.getValue();
                    if (tournaments) {
                        this._tournaments.next([tournament, ...tournaments]);
                    }
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Update tournament
     */
    update(id: string, payload: UpdateTournamentRequest): Observable<Tournament> {
        return this._httpClient
            .patch<Tournament>(`${this.apiUrl}/tournaments/${id}`, payload)
            .pipe(
                tap((tournament) => {
                    // Update in the list
                    const tournaments = this._tournaments.getValue();
                    if (tournaments) {
                        const index = tournaments.findIndex(
                            (t) => t.id === id
                        );
                        if (index !== -1) {
                            tournaments[index] = tournament;
                            this._tournaments.next([...tournaments]);
                        }
                    }
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Delete tournament
     */
    remove(id: string): Observable<boolean> {
        return this._httpClient
            .delete<boolean>(`${this.apiUrl}/tournaments/${id}`)
            .pipe(
                tap(() => {
                    // Remove from list
                    const tournaments = this._tournaments.getValue();
                    if (tournaments) {
                        const filtered = tournaments.filter((t) => t.id !== id);
                        this._tournaments.next(filtered);
                    }
                })
            );
    }

    /**
     * Publish tournament
     */
    publish(id: string): Observable<Tournament> {
        return this._httpClient
            .post<Tournament>(`${this.apiUrl}/tournaments/${id}/publish`, {})
            .pipe(
                tap((tournament) => {
                    // Update in the list
                    const tournaments = this._tournaments.getValue();
                    if (tournaments) {
                        const index = tournaments.findIndex(
                            (t) => t.id === id
                        );
                        if (index !== -1) {
                            tournaments[index] = tournament;
                            this._tournaments.next([...tournaments]);
                        }
                    }
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Archive tournament
     */
    archive(id: string): Observable<Tournament> {
        return this._httpClient
            .post<Tournament>(`${this.apiUrl}/tournaments/${id}/archive`, {})
            .pipe(
                tap((tournament) => {
                    // Update in the list
                    const tournaments = this._tournaments.getValue();
                    if (tournaments) {
                        const index = tournaments.findIndex(
                            (t) => t.id === id
                        );
                        if (index !== -1) {
                            tournaments[index] = tournament;
                            this._tournaments.next([...tournaments]);
                        }
                    }
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Replace participants
     */
    replaceParticipants(
        id: string,
        userIds: string[]
    ): Observable<Tournament> {
        const payload: ReplaceParticipantsRequest = { userIds };
        return this._httpClient
            .put<Tournament>(
                `${this.apiUrl}/tournaments/${id}/participants`,
                payload
            )
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Generate homogeneous teams
     */
    generateTeams(id: string): Observable<Tournament> {
        return this._httpClient
            .post<Tournament>(
                `${this.apiUrl}/tournaments/${id}/generate-teams`,
                {}
            )
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Reorder teams
     */
    reorderTeams(id: string, teamOrder: string[]): Observable<Tournament> {
        const payload: ReorderTeamsRequest = { teamOrder };
        return this._httpClient
            .post<Tournament>(
                `${this.apiUrl}/tournaments/${id}/reorder-teams`,
                payload
            )
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Set team placement
     */
    setTeamPlacement(
        id: string,
        teamId: string,
        placement: number | null
    ): Observable<Tournament> {
        const payload: SetTeamPlacementRequest = { placement };
        return this._httpClient
            .patch<Tournament>(
                `${this.apiUrl}/tournaments/${id}/teams/${teamId}/placement`,
                payload
            )
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - User
    // -----------------------------------------------------------------------------------------------------

    /**
     * List user's tournaments
     */
    listMine(
        scope: 'upcoming' | 'past' | 'all' = 'all'
    ): Observable<Tournament[]> {
        let params = new HttpParams();
        params = params.set('scope', scope);

        return this._httpClient.get<Tournament[]>(
            `${this.apiUrl}/tournaments/mine`,
            { params }
        );
    }

    /**
     * RSVP to tournament
     */
    rsvp(id: string, status: RsvpStatus): Observable<Tournament> {
        const payload: TournamentRsvpRequest = { status };
        return this._httpClient
            .post<Tournament>(`${this.apiUrl}/tournaments/${id}/rsvp`, payload)
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    /**
     * Submit feedback
     */
    feedback(id: string, feedback: string): Observable<Tournament> {
        const payload: TournamentFeedbackRequest = { feedback };
        return this._httpClient
            .post<Tournament>(
                `${this.apiUrl}/tournaments/${id}/feedback`,
                payload
            )
            .pipe(
                tap((tournament) => {
                    this._tournament.next(tournament);
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - Utilities
    // -----------------------------------------------------------------------------------------------------

    /**
     * Lookup users for participant selection
     */
    lookupUsers(roles?: string): Observable<UserLookupResult[]> {
        let params = new HttpParams();
        if (roles !== undefined && roles !== null) {
            params = params.set('roles', roles);
        }

        return this._httpClient.get<UserLookupResult[]>(
            `${this.apiUrl}/users/lookup`,
            { params }
        );
    }

    /**
     * Reset the tournament observable
     */
    resetTournament(): void {
        this._tournament.next(null);
    }
}
