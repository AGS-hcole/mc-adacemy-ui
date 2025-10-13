import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    private apiUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update user profile
     */
    updateMe(data: any): Observable<User> {
        return this._httpClient.put<User>(`${this.apiUrl}/users/me`, data).pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update user consents
     */
    updateConsents(data: { privacyConsent: boolean; photoConsent: boolean; marketingConsent: boolean }): Observable<any> {
        return this._httpClient.put(`${this.apiUrl}/users/me/consents`, data);
    }

    /**
     * Upload avatar
     */
    uploadAvatar(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('avatar', file);
        return this._httpClient.post(`${this.apiUrl}/users/me/avatar`, formData);
    }

    /**
     * Upload background
     */
    uploadBackground(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('background', file);
        return this._httpClient.post(`${this.apiUrl}/users/me/background`, formData);
    }
}
