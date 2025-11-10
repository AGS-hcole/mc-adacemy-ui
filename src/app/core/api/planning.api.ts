import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {
    PresenceMark,
    ResidenceWeekPlanDto,
    SchoolDto,
    TransportAssignmentStatus,
    TransportDirection,
    TransportRunDto,
    TransportTemplateDto,
    TransportWeekPlanDto,
    UUID,
} from '../models/planning';

@Injectable({ providedIn: 'root' })
export class PlanningApi {
    private http = inject(HttpClient);
    private base = environment.apiUrl;

    // Residence
    getMyResidenceWeekPlan(weekStart: string): Observable<ResidenceWeekPlanDto> {
        return this.http.get<ResidenceWeekPlanDto>(
            `${this.base}/residence/week-plans/me`,
            { params: { weekStart } }
        );
    }

    getStudentResidenceWeekPlan(
        studentId: UUID,
        weekStart: string
    ): Observable<ResidenceWeekPlanDto> {
        return this.http.get<ResidenceWeekPlanDto>(
            `${this.base}/residence/week-plans/${studentId}`,
            { params: { weekStart } }
        );
    }

    saveResidenceWeekPlan(payload: {
        nights: string[];
        studentId?: UUID;
        weekStartDate?: string;
    }): Observable<void> {
        return this.http.post<void>(`${this.base}/residence/week-plans`, payload);
    }

    adminConfirmResidenceNight(payload: {
        studentId: UUID;
        date: string;
        confirmedPresent: boolean;
    }): Observable<void> {
        return this.http.patch<void>(`${this.base}/residence/confirm`, payload);
    }

    // Transport templates (admin)
    listTransportTemplates(): Observable<TransportTemplateDto[]> {
        return this.http.get<TransportTemplateDto[]>(
            `${this.base}/transport/templates`
        );
    }

    createTransportTemplate(
        dto: Partial<TransportTemplateDto>
    ): Observable<TransportTemplateDto> {
        return this.http.post<TransportTemplateDto>(
            `${this.base}/transport/templates`,
            dto
        );
    }

    updateTransportTemplate(
        id: UUID,
        dto: Partial<TransportTemplateDto>
    ): Observable<TransportTemplateDto> {
        return this.http.patch<TransportTemplateDto>(
            `${this.base}/transport/templates/${id}`,
            dto
        );
    }

    deleteTransportTemplate(id: UUID): Observable<void> {
        return this.http.delete<void>(`${this.base}/transport/templates/${id}`);
    }

    // Schools (for templates)
    listSchools(): Observable<SchoolDto[]> {
        return this.http.get<SchoolDto[]>(`${this.base}/schools`);
    }

    // Transport week plans
    getMyTransportWeekPlan(weekStart: string): Observable<TransportWeekPlanDto> {
        return this.http.get<TransportWeekPlanDto>(
            `${this.base}/transport/week-plans/me`,
            { params: { weekStart } }
        );
    }

    getStudentTransportWeekPlan(
        studentId: UUID,
        weekStart: string
    ): Observable<TransportWeekPlanDto> {
        return this.http.get<TransportWeekPlanDto>(
            `${this.base}/transport/week-plans/${studentId}`,
            { params: { weekStart } }
        );
    }

    saveTransportWeekPlan(payload: {
        entries: { templateId: UUID; date: string; direction: TransportDirection }[];
        studentId?: UUID;
    }): Observable<void> {
        return this.http.post<void>(`${this.base}/transport/week-plans`, payload);
    }

    // Transport runs
    generateRunsForWeek(weekStart: string): Observable<{ generated: boolean }> {
        return this.http.post<{ generated: boolean }>(
            `${this.base}/transport/runs/generate`,
            null,
            { params: { weekStart } }
        );
    }

    listRuns(range: { from: string; to: string }): Observable<TransportRunDto[]> {
        return this.http.get<TransportRunDto[]>(`${this.base}/transport/runs`, {
            params: { from: range.from, to: range.to },
        });
    }

    assignStudentToRun(
        runId: UUID,
        payload: { studentId: UUID; status?: TransportAssignmentStatus }
    ): Observable<void> {
        return this.http.post<void>(
            `${this.base}/transport/runs/${runId}/assign`,
            payload
        );
    }

    checkinRun(
        runId: UUID,
        presences: { studentId: UUID; mark: PresenceMark; notes?: string }[]
    ): Observable<void> {
        return this.http.post<void>(`${this.base}/transport/runs/${runId}/checkin`, {
            presences,
        });
    }
}
