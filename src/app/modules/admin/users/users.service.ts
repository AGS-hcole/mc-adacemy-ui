import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import {
    BehaviorSubject,
    Observable,
    filter,
    map,
    switchMap,
    take,
    tap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
    // Private
    private apiUrl = environment.apiUrl;
    private _user: BehaviorSubject<User | null> = new BehaviorSubject(null);
    private _users: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    private _roles: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for user
     */
    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    /**
     * Getter for users
     */
    get users$(): Observable<User[]> {
        return this._users.asObservable();
    }

    /**
     * Getter for roles
     */
    get roles$(): Observable<Role[]> {
        return this._roles.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get users
     */
    getUsers(): Observable<User[]> {
        return this._httpClient.get<User[]>(`${this.apiUrl}/users`).pipe(
            tap((users) => {
                this._users.next(users);
            })
        );
    }

    /**
     * Get user by id
     */
    getUserById(id: string): Observable<User> {
        return this._httpClient.get<User>(`${this.apiUrl}/users/${id}`).pipe(
            tap((user) => {
                // Update the user
                this._user.next(user);
            })
        );
    }

    /**
     * Create user
     */
    createUser(user: any): Observable<User> {
        return this.users$.pipe(
            take(1),
            switchMap((users) =>
                this._httpClient.post<User>(`${this.apiUrl}/users`, user).pipe(
                    map((newUser) => {
                        // Update the users with the new user
                        this._users.next([newUser, ...users]);

                        // Return the new user
                        return newUser;
                    })
                )
            )
        );
    }

    /**
     * Update user
     *
     * @param id
     * @param user
     */
    updateUser(id: string, user: any): Observable<User> {
        return this.users$.pipe(
            take(1),
            switchMap((users) =>
                this._httpClient
                    .patch<User>(`${this.apiUrl}/users/${id}`, user)
                    .pipe(
                        map((updatedUser) => {
                            // Find the index of the updated user
                            const index = users.findIndex(
                                (item) => item.id === id
                            );

                            // Update the user
                            users[index] = updatedUser;

                            // Update the users
                            this._users.next(users);

                            // Return the updated user
                            return updatedUser;
                        }),
                        switchMap((updatedUser) =>
                            this.user$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the user if it's selected
                                    this._user.next(updatedUser);

                                    // Return the updated user
                                    return updatedUser;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the user
     *
     * @param id
     */
    deleteUser(id: string): Observable<boolean> {
        return this.users$.pipe(
            take(1),
            switchMap((users) =>
                this._httpClient.delete(`${this.apiUrl}/users/${id}`).pipe(
                    map((isDeleted: boolean) => {
                        // Find the index of the deleted user
                        const index = users.findIndex((item) => item.id === id);

                        // Mark user as deleted or delete it from the list
                        // Depending on the email confirmation status
                        // If the user is not confirmed, we delete it
                        // If the user is confirmed, we just mark it as deleted
                        if (index !== -1) {
                            users.splice(index, 1);
                        }

                        // Update the users
                        this._users.next(users);

                        // Return the deleted status
                        return isDeleted;
                    })
                )
            )
        );
    }

    /**
     * Associate a player to a parent user
     *
     * @param parentId
     * @param playerId
     */
    addPlayer(parentId: string, playerId: string): Observable<User> {
        return this._httpClient
            .post(`${this.apiUrl}/users/${parentId}/players/${playerId}`, null)
            .pipe(switchMap(() => this.getUserById(parentId)));
    }

    /**
     * Remove a player association from a parent user
     *
     * @param parentId
     * @param playerId
     */
    removePlayer(parentId: string, playerId: string): Observable<User> {
        return this._httpClient
            .delete(`${this.apiUrl}/users/${parentId}/players/${playerId}`)
            .pipe(switchMap(() => this.getUserById(parentId)));
    }

    /**
     * Get roles
     */
    getRoles(): Observable<Role[]> {
        return this._httpClient.get<Role[]>(`${this.apiUrl}/roles`).pipe(
            tap((roles) => {
                this._roles.next(roles);
            })
        );
    }

    /**
     * Update the avatar of the given user
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(user: User, avatar: File): Observable<User> {
        // Assign the avatar to the user field
        const reader = new FileReader();
        reader.onload = () => {
            user.avatarData = reader.result as string;
        };
        reader.readAsDataURL(avatar);

        return this.users$.pipe(
            take(1),
            switchMap((users) =>
                this._httpClient
                    .put<User>(`${this.apiUrl}/users/${user.id}`, user)
                    .pipe(
                        map((updatedUser) => {
                            // Find the index of the updated user
                            const index = users.findIndex(
                                (item) => item.id === user.id
                            );

                            // Update the user
                            users[index] = updatedUser;

                            // Update the users
                            this._users.next(users);

                            // Return the updated user
                            return updatedUser;
                        }),
                        switchMap((updatedUser) =>
                            this.user$.pipe(
                                take(1),
                                filter((item) => item && item.id === user.id),
                                tap(() => {
                                    // Update the user if it's selected
                                    this._user.next(updatedUser);

                                    // Return the updated user
                                    return updatedUser;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Reset the user observable to null
     */
    resetUser(): void {
        this._user.next(null);
    }
}
