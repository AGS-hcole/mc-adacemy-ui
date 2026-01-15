import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';
import {
    BookOccurrenceRequest,
    CancelOccurrenceRequest,
    CreateTransportTemplateRequest,
    GenerateOccurrencesRequest,
    TransportOccurrence,
    TransportOccurrenceFilters,
    TransportTemplate,
    TransportTemplateFilters,
    UpdateTransportTemplateRequest,
} from './transport.types';

@Injectable({ providedIn: 'root' })
export class TransportsService {
    private apiUrl = environment.apiUrl;
    private _template: BehaviorSubject<TransportTemplate | null> =
        new BehaviorSubject(null);
    private _templates: BehaviorSubject<TransportTemplate[] | null> =
        new BehaviorSubject(null);
    private _occurrences: BehaviorSubject<TransportOccurrence[] | null> =
        new BehaviorSubject(null);
    private _occurrence: BehaviorSubject<TransportOccurrence | null> =
        new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for template
     */
    get template$(): Observable<TransportTemplate> {
        return this._template.asObservable();
    }

    /**
     * Getter for templates
     */
    get templates$(): Observable<TransportTemplate[]> {
        return this._templates.asObservable();
    }

    /**
     * Getter for occurrences
     */
    get occurrences$(): Observable<TransportOccurrence[]> {
        return this._occurrences.asObservable();
    }

    /**
     * Getter for occurrence
     */
    get occurrence$(): Observable<TransportOccurrence> {
        return this._occurrence.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - Templates (ADMIN)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all templates with optional filters
     */
    getTemplates(
        filters?: TransportTemplateFilters
    ): Observable<TransportTemplate[]> {
        let params = new HttpParams();

        if (filters) {
            if (filters.search) {
                params = params.set('search', filters.search);
            }
            if (filters.page !== null && filters.page !== undefined) {
                params = params.set('page', String(filters.page));
            }
            if (filters.size !== null && filters.size !== undefined) {
                params = params.set('size', String(filters.size));
            }
            if (
                filters.isActive !== null &&
                filters.isActive !== undefined
            ) {
                params = params.set('isActive', String(filters.isActive));
            }
        }

        return this._httpClient
            .get<TransportTemplate[]>(`${this.apiUrl}/transports/templates`, {
                params,
            })
            .pipe(
                tap((templates) => {
                    this._templates.next(templates);
                })
            );
    }

    /**
     * Get template by id
     */
    getTemplateById(id: string): Observable<TransportTemplate> {
        return this._httpClient
            .get<TransportTemplate>(`${this.apiUrl}/transports/templates/${id}`)
            .pipe(
                tap((template) => {
                    this._template.next(template);
                })
            );
    }

    /**
     * Create template
     */
    createTemplate(
        request: CreateTransportTemplateRequest
    ): Observable<TransportTemplate> {
        return this._templates.pipe(
            take(1),
            switchMap((templates) =>
                this._httpClient
                    .post<TransportTemplate>(
                        `${this.apiUrl}/transports/templates`,
                        request
                    )
                    .pipe(
                        map((newTemplate) => {
                            // Update the templates with the new template
                            const updatedTemplates = templates || [];
                            this._templates.next([
                                newTemplate,
                                ...updatedTemplates,
                            ]);
                            return newTemplate;
                        })
                    )
            )
        );
    }

    /**
     * Update template
     */
    updateTemplate(
        id: string,
        request: UpdateTransportTemplateRequest
    ): Observable<TransportTemplate> {
        return this._templates.pipe(
            take(1),
            switchMap((templates) =>
                this._httpClient
                    .put<TransportTemplate>(
                        `${this.apiUrl}/transports/templates/${id}`,
                        request
                    )
                    .pipe(
                        map((updatedTemplate) => {
                            if (templates) {
                                // Find the index of the updated template
                                const index = templates.findIndex(
                                    (item) => item.id === id
                                );

                                if (index !== -1) {
                                    // Update the template
                                    templates[index] = updatedTemplate;
                                    this._templates.next([...templates]);
                                }
                            }

                            // Update the current template if it matches
                            const currentTemplate = this._template.getValue();
                            if (currentTemplate && currentTemplate.id === id) {
                                this._template.next(updatedTemplate);
                            }

                            return updatedTemplate;
                        })
                    )
            )
        );
    }

    /**
     * Disable template (soft delete - set isActive=false)
     */
    disableTemplate(id: string): Observable<TransportTemplate> {
        return this.updateTemplate(id, { isActive: false });
    }

    /**
     * Generate occurrences for a template
     */
    generateOccurrences(
        templateId: string,
        request: GenerateOccurrencesRequest
    ): Observable<TransportOccurrence[]> {
        return this._httpClient.post<TransportOccurrence[]>(
            `${this.apiUrl}/transports/templates/${templateId}/generate-occurrences`,
            request
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - Occurrences (AUTH)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get occurrences with filters
     */
    getOccurrences(
        filters?: TransportOccurrenceFilters
    ): Observable<TransportOccurrence[]> {
        let params = new HttpParams();

        if (filters) {
            if (filters.from) {
                params = params.set('from', filters.from);
            }
            if (filters.to) {
                params = params.set('to', filters.to);
            }
            if (filters.templateId) {
                params = params.set('templateId', filters.templateId);
            }
            if (filters.status) {
                params = params.set('status', filters.status);
            }
        }

        return this._httpClient
            .get<TransportOccurrence[]>(
                `${this.apiUrl}/transports/occurrences`,
                { params }
            )
            .pipe(
                tap((occurrences) => {
                    this._occurrences.next(occurrences);
                })
            );
    }

    /**
     * Get occurrence by id (admin may include bookings)
     */
    getOccurrenceById(id: string): Observable<TransportOccurrence> {
        return this._httpClient
            .get<TransportOccurrence>(
                `${this.apiUrl}/transports/occurrences/${id}`
            )
            .pipe(
                tap((occurrence) => {
                    this._occurrence.next(occurrence);
                })
            );
    }

    /**
     * Cancel occurrence (admin only)
     */
    cancelOccurrence(
        id: string,
        request: CancelOccurrenceRequest
    ): Observable<TransportOccurrence> {
        return this._httpClient
            .post<TransportOccurrence>(
                `${this.apiUrl}/transports/occurrences/${id}/cancel`,
                request
            )
            .pipe(
                tap((updatedOccurrence) => {
                    // Update the occurrence in the list
                    const occurrences = this._occurrences.getValue();
                    if (occurrences) {
                        const index = occurrences.findIndex(
                            (o) => o.id === id
                        );
                        if (index !== -1) {
                            occurrences[index] = updatedOccurrence;
                            this._occurrences.next([...occurrences]);
                        }
                    }

                    // Update the current occurrence if it matches
                    const currentOccurrence = this._occurrence.getValue();
                    if (currentOccurrence && currentOccurrence.id === id) {
                        this._occurrence.next(updatedOccurrence);
                    }
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - Bookings (AUTH)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Book an occurrence (user)
     */
    bookOccurrence(
        occurrenceId: string,
        request: BookOccurrenceRequest = { seats: 1 }
    ): Observable<TransportOccurrence> {
        return this._httpClient
            .post<TransportOccurrence>(
                `${this.apiUrl}/transports/occurrences/${occurrenceId}/book`,
                request
            )
            .pipe(
                tap((updatedOccurrence) => {
                    // Update the occurrence in the list
                    const occurrences = this._occurrences.getValue();
                    if (occurrences) {
                        const index = occurrences.findIndex(
                            (o) => o.id === occurrenceId
                        );
                        if (index !== -1) {
                            occurrences[index] = updatedOccurrence;
                            this._occurrences.next([...occurrences]);
                        }
                    }

                    // Update the current occurrence if it matches
                    const currentOccurrence = this._occurrence.getValue();
                    if (
                        currentOccurrence &&
                        currentOccurrence.id === occurrenceId
                    ) {
                        this._occurrence.next(updatedOccurrence);
                    }
                })
            );
    }

    /**
     * Cancel a booking
     */
    cancelBooking(bookingId: string): Observable<void> {
        return this._httpClient
            .delete<void>(`${this.apiUrl}/transports/bookings/${bookingId}`)
            .pipe(
                tap(() => {
                    // Refresh occurrences to update booking status
                    const occurrences = this._occurrences.getValue();
                    if (occurrences) {
                        // Trigger a refresh by re-emitting (actual data will be updated on next fetch)
                        this._occurrences.next([...occurrences]);
                    }
                })
            );
    }

    /**
     * Reset the template observable
     */
    resetTemplate(): void {
        this._template.next(null);
    }
}
