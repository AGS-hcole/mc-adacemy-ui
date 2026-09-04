import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ParentChild, ParentDashboardDto } from './parent.types';

@Injectable({ providedIn: 'root' })
export class ParentService {
    private _httpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    private _children$ = new BehaviorSubject<ParentChild[]>([]);
    private _selectedChild$ = new BehaviorSubject<ParentChild | null>(null);

    get children$(): Observable<ParentChild[]> {
        return this._children$.asObservable();
    }

    get selectedChild$(): Observable<ParentChild | null> {
        return this._selectedChild$.asObservable();
    }

    loadChildren(): Observable<ParentChild[]> {
        return this._httpClient
            .get<ParentChild[]>(`${this.apiUrl}/parent/children`)
            .pipe(
                tap((children) => {
                    this._children$.next(children);
                    const current = this._selectedChild$.value;
                    const isCurrentStillValid =
                        !!current &&
                        children.some((child) => child.id === current.id);
                    if (!isCurrentStillValid) {
                        this._selectedChild$.next(
                            children.length > 0 ? children[0] : null
                        );
                    }
                })
            );
    }

    selectChild(child: ParentChild): void {
        this._selectedChild$.next(child);
    }

    getDashboard(): Observable<ParentDashboardDto> {
        return this._httpClient.get<ParentDashboardDto>(
            `${this.apiUrl}/parent/dashboard`
        );
    }
}
