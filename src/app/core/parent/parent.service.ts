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
                    if (children.length > 0 && !this._selectedChild$.value) {
                        this._selectedChild$.next(children[0]);
                    }
                })
            );
    }

    selectChild(child: ParentChild): void {
        this._selectedChild$.next(child);
    }

    getDashboard(childId: string): Observable<ParentDashboardDto> {
        return this._httpClient.get<ParentDashboardDto>(
            `${this.apiUrl}/parent/dashboard`,
            { params: { childId } }
        );
    }
}
