import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, concatMap, map, of, tap } from 'rxjs';
import {
    CreateTrainingGroupRequest,
    CreateTrainingGroupScheduleRequest,
    TrainingGroup,
    TrainingGroupMemberBulkRequest,
    UpdateTrainingGroupRequest,
    UpdateTrainingGroupScheduleRequest,
} from './training-group.types';

@Injectable({ providedIn: 'root' })
export class TrainingGroupsService {
    private apiUrl = environment.apiUrl;
    private _trainingGroup: BehaviorSubject<TrainingGroup | null> =
        new BehaviorSubject<TrainingGroup | null>(null);
    private _trainingGroups: BehaviorSubject<TrainingGroup[] | null> =
        new BehaviorSubject<TrainingGroup[] | null>(null);

    constructor(private _httpClient: HttpClient) {}

    get trainingGroup$(): Observable<TrainingGroup | null> {
        return this._trainingGroup.asObservable();
    }

    get trainingGroups$(): Observable<TrainingGroup[] | null> {
        return this._trainingGroups.asObservable();
    }

    list(): Observable<TrainingGroup[]> {
        return this._httpClient
            .get<TrainingGroup[]>(`${this.apiUrl}/training-groups`)
            .pipe(
                tap((trainingGroups) => {
                    this._trainingGroups.next(trainingGroups);
                })
            );
    }

    getById(id: string): Observable<TrainingGroup> {
        return this._httpClient
            .get<TrainingGroup>(`${this.apiUrl}/training-groups/${id}`)
            .pipe(
                tap((trainingGroup) => {
                    this._trainingGroup.next(trainingGroup);
                })
            );
    }

    create(payload: CreateTrainingGroupRequest): Observable<TrainingGroup> {
        return this._httpClient
            .post<TrainingGroup>(`${this.apiUrl}/training-groups`, payload)
            .pipe(
                tap((trainingGroup) => {
                    const trainingGroups = this._trainingGroups.getValue();
                    if (trainingGroups) {
                        this._trainingGroups.next([
                            trainingGroup,
                            ...trainingGroups,
                        ]);
                    }
                    this._trainingGroup.next(trainingGroup);
                })
            );
    }

    update(
        id: string,
        payload: UpdateTrainingGroupRequest
    ): Observable<TrainingGroup> {
        return this._httpClient
            .patch<TrainingGroup>(
                `${this.apiUrl}/training-groups/${id}`,
                payload
            )
            .pipe(
                tap((trainingGroup) => {
                    this._updateTrainingGroupInCollection(id, trainingGroup);
                    this._trainingGroup.next(trainingGroup);
                })
            );
    }

    delete(id: string): Observable<boolean> {
        return this._httpClient
            .delete<void>(`${this.apiUrl}/training-groups/${id}`)
            .pipe(
                map(() => {
                    const trainingGroups = this._trainingGroups.getValue();
                    if (trainingGroups) {
                        this._trainingGroups.next(
                            trainingGroups.filter(
                                (trainingGroup) => trainingGroup.id !== id
                            )
                        );
                    }

                    const currentTrainingGroup = this._trainingGroup.getValue();
                    if (currentTrainingGroup?.id === id) {
                        this._trainingGroup.next(null);
                    }

                    return true;
                })
            );
    }

    addMembers(
        id: string,
        payload: TrainingGroupMemberBulkRequest,
        syncState: boolean = true
    ): Observable<void> {
        return this._httpClient
            .post<void>(`${this.apiUrl}/training-groups/${id}/members`, payload)
            .pipe(
                concatMap(() => (syncState ? this.syncState(id) : of(null))),
                map(() => void 0)
            );
    }

    removeMembers(
        id: string,
        payload: TrainingGroupMemberBulkRequest,
        syncState: boolean = true
    ): Observable<void> {
        return this._httpClient
            .request<void>(
                'delete',
                `${this.apiUrl}/training-groups/${id}/members`,
                {
                    body: payload,
                }
            )
            .pipe(
                concatMap(() => (syncState ? this.syncState(id) : of(null))),
                map(() => void 0)
            );
    }

    createSchedule(
        id: string,
        payload: CreateTrainingGroupScheduleRequest,
        syncState: boolean = true
    ): Observable<void> {
        return this._httpClient
            .post<void>(
                `${this.apiUrl}/training-groups/${id}/schedules`,
                payload
            )
            .pipe(
                concatMap(() => (syncState ? this.syncState(id) : of(null))),
                map(() => void 0)
            );
    }

    updateSchedule(
        id: string,
        scheduleId: string,
        payload: UpdateTrainingGroupScheduleRequest,
        syncState: boolean = true
    ): Observable<void> {
        return this._httpClient
            .patch<void>(
                `${this.apiUrl}/training-groups/${id}/schedules/${scheduleId}`,
                payload
            )
            .pipe(
                concatMap(() => (syncState ? this.syncState(id) : of(null))),
                map(() => void 0)
            );
    }

    deleteSchedule(
        id: string,
        scheduleId: string,
        syncState: boolean = true
    ): Observable<void> {
        return this._httpClient
            .delete<void>(
                `${this.apiUrl}/training-groups/${id}/schedules/${scheduleId}`
            )
            .pipe(
                concatMap(() => (syncState ? this.syncState(id) : of(null))),
                map(() => void 0)
            );
    }

    syncState(id: string): Observable<void> {
        return this.getById(id).pipe(
            concatMap(() => this.list()),
            map(() => void 0)
        );
    }

    resetTrainingGroup(): void {
        this._trainingGroup.next(null);
    }

    private _updateTrainingGroupInCollection(
        id: string,
        trainingGroup: TrainingGroup
    ): void {
        const trainingGroups = this._trainingGroups.getValue();
        if (!trainingGroups) {
            return;
        }

        const index = trainingGroups.findIndex((item) => item.id === id);
        if (index === -1) {
            return;
        }

        trainingGroups[index] = trainingGroup;
        this._trainingGroups.next([...trainingGroups]);
    }
}
