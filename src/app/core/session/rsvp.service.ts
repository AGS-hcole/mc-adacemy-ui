import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, tap } from 'rxjs';
import { RsvpRequest, Session } from './session.types';

@Injectable({ providedIn: 'root' })
export class RsvpService {
    private apiUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register user for a session (RSVP)
     */
    rsvp(sessionId: string): Observable<Session> {
        return this._httpClient.post<Session>(
            `${this.apiUrl}/sessions/${sessionId}/rsvp`,
            {}
        );
    }

    /**
     * Cancel user's RSVP for a session
     */
    cancelRsvp(sessionId: string): Observable<Session> {
        return this._httpClient.delete<Session>(
            `${this.apiUrl}/sessions/${sessionId}/rsvp`
        );
    }

    /**
     * Check if user can register for a session
     * This is a helper method that should be called before attempting RSVP
     */
    canRegister(session: Session, userFormula?: string | null): {
        canRegister: boolean;
        reason?: string;
    } {
        // Check if session is cancelled
        if (session.isCancelled) {
            return {
                canRegister: false,
                reason: 'SESSION_CANCELLED',
            };
        }

        // Check if session is published
        if (!session.isPublished) {
            return {
                canRegister: false,
                reason: 'SESSION_NOT_PUBLISHED',
            };
        }

        // Check if session is full
        if (
            session.maxAttendees &&
            session.currentAttendees &&
            session.currentAttendees >= session.maxAttendees
        ) {
            return {
                canRegister: false,
                reason: 'SESSION_FULL',
            };
        }

        return {
            canRegister: true,
        };
    }
}
