import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import {
    BehaviorSubject,
    catchError,
    filter,
    finalize,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;
    private _http = inject(HttpClient);
    private _userService = inject(UserService);
    private _authenticated = false;
    private _mustOnboard: boolean = false;

    private _refreshInProgress = false;
    private _refreshSubject = new BehaviorSubject<string | null>(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }
    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }
    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    /**
     * Getter for mustOnboard flag
     */
    get mustOnboard(): boolean {
        return this._mustOnboard;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get current user with mustOnboard flag
     */
    getMe(): Observable<any> {
        return this._http.get(`${this.apiUrl}/auth/me`).pipe(
            switchMap((response: any) => {
                // Update mustOnboard flag
                this._mustOnboard =
                    response.mustOnboard ??
                    response.user?.privacyConsentAt == null;

                // Update user
                if (response.user) {
                    this._userService.user = response.user;
                }

                return of(response);
            })
        );
    }

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._http.post(
            `${this.apiUrl}/auth/request-reset-password`,
            email
        );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(token: string, password: string): Observable<any> {
        return this._http.post(`${this.apiUrl}/auth/reset-password`, {
            token: token,
            password: password,
        });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._http
            .post(`${this.apiUrl}/auth/sign-in`, {
                email: credentials.email,
                password: credentials.password,
            })
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.accessToken;
                    this.refreshToken = response.refreshToken;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Set mustOnboard flag
                    this._mustOnboard =
                        response.mustOnboard ??
                        response.user?.privacyConsentAt == null;

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._http
            .post(`${this.apiUrl}/auth/refresh-token`, {
                refreshToken: this.refreshToken,
            })
            .pipe(
                catchError(() => {
                    // Return false
                    return of(false);
                }),
                switchMap((response: any) => {
                    if (!response || !response.user) {
                        return of(false);
                    }
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken && response.refreshToken) {
                        this.accessToken = response.accessToken;
                        this.refreshToken = response.refreshToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Set mustOnboard flag
                    this._mustOnboard =
                        response.mustOnboard ??
                        response.user?.privacyConsentAt == null;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access & refresh tokens from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken && !this.refreshToken) {
            return of(false);
        }

        // Check the access token expire date
        if (
            AuthUtils.isTokenExpired(this.accessToken) &&
            AuthUtils.isTokenExpired(this.refreshToken)
        ) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    /**
     * Centralized refresh: single-flight + queue
     */
    refreshAccessToken(): Observable<string> {
        // No valid refresh token -> fail fast
        if (!this.refreshToken || AuthUtils.isTokenExpired(this.refreshToken)) {
            return throwError(() => new Error('No valid refresh token'));
        }

        if (this._refreshInProgress) {
            // Wait for the in-flight refresh to finish
            return this._refreshSubject.pipe(
                filter((t) => t !== null),
                take(1)
            ) as Observable<string>;
        }

        this._refreshInProgress = true;
        this._refreshSubject.next(null);

        return this._http
            .post(`${this.apiUrl}/auth/refresh-token`, {
                refreshToken: this.refreshToken,
            })
            .pipe(
                tap((resp: any) => {
                    if (!resp?.accessToken)
                        throw new Error('No accessToken in refresh response');
                    // Update tokens
                    this.accessToken = resp.accessToken;
                    if (resp.refreshToken)
                        this.refreshToken = resp.refreshToken;
                    this._authenticated = true;
                    if (resp.user) this._userService.user = resp.user;
                }),
                map((resp: any) => resp.accessToken as string),
                tap((newToken) => this._refreshSubject.next(newToken)),
                catchError((err) => {
                    // Hard sign out on refresh failure
                    this.signOut().subscribe();
                    return throwError(() => err);
                }),
                finalize(() => {
                    this._refreshInProgress = false;
                })
            );
    }
}
