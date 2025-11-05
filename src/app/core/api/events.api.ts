import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResponse, PublicEvent } from '../models/public-event.model';

@Injectable({ providedIn: 'root' })
export class EventsApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // Public list: backend defaults to published+active when unauthenticated
    list(params?: {
        page?: number;
        pageSize?: number;
        sort?: 'recent' | 'order';
    }): Observable<PaginatedResponse<PublicEvent>> {
        let p = new HttpParams();
        if (params?.page) p = p.set('page', params.page);
        if (params?.pageSize) p = p.set('pageSize', params.pageSize);
        p = p.set('sort', params?.sort ?? 'order');
        return this.http.get<PaginatedResponse<PublicEvent>>(
            `${this.baseUrl}/public/events`,
            { params: p }
        );
    }

    // Admin list: same endpoint, but authenticated; can pass extra flags if backend supports them
    listAdmin(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        activeOnly?: boolean;
        publishedOnly?: boolean;
        sort?: 'recent' | 'order';
    }): Observable<PaginatedResponse<PublicEvent>> {
        let p = new HttpParams();
        if (params?.page) p = p.set('page', params.page);
        if (params?.pageSize) p = p.set('pageSize', params.pageSize);
        if (params?.search) p = p.set('search', params.search);
        if (typeof params?.activeOnly === 'boolean')
            p = p.set('activeOnly', String(params.activeOnly));
        if (typeof params?.publishedOnly === 'boolean')
            p = p.set('publishedOnly', String(params.publishedOnly));
        p = p.set('sort', params?.sort ?? 'order');
        return this.http.get<PaginatedResponse<PublicEvent>>(
            `${this.baseUrl}/admin/events`,
            { params: p }
        );
    }

    getBySlug(slug: string): Observable<PublicEvent> {
        return this.http.get<PublicEvent>(
            `${this.baseUrl}/public/events/${slug}`
        );
    }

    // Admin by id
    getById(id: string): Observable<PublicEvent> {
        return this.http.get<PublicEvent>(`${this.baseUrl}/admin/events/${id}`);
    }

    create(dto: Partial<PublicEvent>): Observable<PublicEvent> {
        return this.http.post<PublicEvent>(`${this.baseUrl}/admin/events`, dto);
    }

    update(id: string, dto: Partial<PublicEvent>): Observable<PublicEvent> {
        return this.http.patch<PublicEvent>(
            `${this.baseUrl}/admin/events/${id}`,
            dto
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/admin/events/${id}`);
    }

    // QR PNG for the public /events page
    getQrPng(url?: string): Observable<Blob> {
        const params = url ? { params: new HttpParams().set('url', url) } : {};
        return this.http.get(`${this.baseUrl}/public/events/qr`, {
            ...params,
            responseType: 'blob',
        });
    }
}
