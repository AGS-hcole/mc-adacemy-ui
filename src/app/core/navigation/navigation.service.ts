import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Navigation } from 'app/core/navigation/navigation.types';
import { cloneDeep } from 'lodash';
import { Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    constructor(private _translocoService: TranslocoService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return new Observable<Navigation>((observer) => {
            Promise.all([import('./navigation.data')]).then(([data]) => {
                observer.next({
                    admin: [
                        ...cloneDeep(data.commonNavigation),
                        ...cloneDeep(data.adminNavigation),
                        ...cloneDeep(data.userNavigation),
                    ],
                    user: [
                        ...cloneDeep(data.commonNavigation),
                        ...cloneDeep(data.userNavigation),
                    ],
                });
                observer.complete();
            });
        }).pipe(tap((navigation) => this._navigation.next(navigation)));
    }
}
