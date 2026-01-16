import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, map, switchMap, take, tap } from 'rxjs';
import {
    BookOccurrenceRequest,
    CancelOccurrenceRequest,
    CreateTransportTemplateRequest,
    DayOfWeek,
    DayOfWeekToNumber,
    GenerateOccurrencesRequest,
    NumberToDayOfWeek,
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
            .get<TransportTemplate[]>(`${this.apiUrl}/transport-templates`, {
                params,
            })
            .pipe(
                map((templates) => this._convertTemplateDaysFromAPI(templates)),
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
            .get<any>(`${this.apiUrl}/transport-templates/${id}`)
            .pipe(
                map((template) => this._convertTemplateDaysFromAPI([template])[0]),
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
                    .post<any>(
                        `${this.apiUrl}/transport-templates`,
                        request
                    )
                    .pipe(
                        map((newTemplate) => {
                            const converted = this._convertTemplateDaysFromAPI([newTemplate])[0];
                            // Update the templates with the new template
                            const updatedTemplates = templates || [];
                            this._templates.next([
                                converted,
                                ...updatedTemplates,
                            ]);
                            return converted;
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
                    .patch<any>(
                        `${this.apiUrl}/transport-templates/${id}`,
                        request
                    )
                    .pipe(
                        map((updatedTemplate) => {
                            const converted = this._convertTemplateDaysFromAPI([updatedTemplate])[0];
                            if (templates) {
                                // Find the index of the updated template
                                const index = templates.findIndex(
                                    (item) => item.id === id
                                );

                                if (index !== -1) {
                                    // Update the template
                                    templates[index] = converted;
                                    this._templates.next([...templates]);
                                }
                            }

                            // Update the current template if it matches
                            const currentTemplate = this._template.getValue();
                            if (currentTemplate && currentTemplate.id === id) {
                                this._template.next(converted);
                            }

                            return converted;
                        })
                    )
            )
        );
    }

    /**
     * Disable template (soft delete via DELETE endpoint)
     */
    disableTemplate(id: string): Observable<void> {
        return this._httpClient
            .delete<void>(`${this.apiUrl}/transport-templates/${id}`)
            .pipe(
                tap(() => {
                    // Remove from local state or mark as inactive
                    const templates = this._templates.getValue();
                    if (templates) {
                        const filtered = templates.filter(t => t.id !== id);
                        this._templates.next(filtered);
                    }
                })
            );
    }

    /**
     * Generate occurrences for a template
     */
    generateOccurrences(
        templateId: string,
        request: GenerateOccurrencesRequest
    ): Observable<TransportOccurrence[]> {
        return this._httpClient.post<TransportOccurrence[]>(
            `${this.apiUrl}/transport-templates/${templateId}/generate`,
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
                `${this.apiUrl}/transport-occurrences`,
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
                `${this.apiUrl}/transport-occurrences/${id}`
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
                `${this.apiUrl}/transport-occurrences/${id}/cancel`,
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
                `${this.apiUrl}/transport-occurrences/${occurrenceId}/book`,
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
            .post<void>(`${this.apiUrl}/transport-bookings/${bookingId}/cancel`, {})
            .pipe(
                tap(() => {
                    // Note: For proper state management, the occurrence should be refreshed
                    // by the component after this operation completes
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private helper methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Convert days of week from API format (numbers) to frontend format (enum)
     */
    private _convertTemplateDaysFromAPI(templates: any[]): TransportTemplate[] {
        return templates.map((template) => ({
            ...template,
            daysOfWeek: (template.daysOfWeek as number[]).map(
                (day) => NumberToDayOfWeek[day]
            ),
        }));
    }

    /**
     * Reset the template observable
     */
    resetTemplate(): void {
        this._template.next(null);
    }
}
