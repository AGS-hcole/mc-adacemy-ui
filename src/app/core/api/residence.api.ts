import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ManorDto, ResidenceStayDto } from '../models/residence.models';

@Injectable({ providedIn: 'root' })
export class ResidenceApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // Manor endpoints
    listManors(activeOnly = true): Observable<ManorDto[]> {
        const params = new HttpParams().set('activeOnly', String(activeOnly));
        return this.http.get<ManorDto[]>(`${this.baseUrl}/residence/manors`, {
            params,
        });
    }

    createManor(payload: Partial<ManorDto>): Observable<ManorDto> {
        return this.http.post<ManorDto>(
            `${this.baseUrl}/residence/manors`,
            payload
        );
    }

    updateManor(id: string, payload: Partial<ManorDto>): Observable<ManorDto> {
        return this.http.patch<ManorDto>(
            `${this.baseUrl}/residence/manors/${id}`,
            payload
        );
    }

    deleteManor(id: string): Observable<void> {
        return this.http.delete<void>(
            `${this.baseUrl}/residence/manors/${id}`
        );
    }

    // Stay endpoints
    getMyStays(from: string, to: string): Observable<ResidenceStayDto[]> {
        const params = new HttpParams().set('from', from).set('to', to);
        return this.http.get<ResidenceStayDto[]>(
            `${this.baseUrl}/residence/stays/me`,
            { params }
        );
    }

    createStay(payload: {
        manorId: string;
        date: string;
    }): Observable<void> {
        return this.http.post<void>(
            `${this.baseUrl}/residence/stays`,
            payload
        );
    }

    cancelStay(payload: {
        manorId: string;
        date: string;
    }): Observable<void> {
        return this.http.post<void>(
            `${this.baseUrl}/residence/stays/cancel`,
            payload
        );
    }
}
