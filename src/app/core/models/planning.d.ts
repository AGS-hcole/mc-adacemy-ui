export type UUID = string;

export type TransportDirection = 'GO' | 'RETURN';
export type TransportRunStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TransportAssignmentStatus = 'ASSIGNED' | 'WAITLISTED' | 'DROPPED';
export type PresenceMark = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export interface SchoolDto {
    id: UUID;
    name: string;
    address?: string;
    city?: string;
    isActive: boolean;
}

export interface TransportTemplateDto {
    id: UUID;
    name: string;
    direction: TransportDirection;
    originLabel: string;
    destinationId: UUID;
    destination?: SchoolDto;
    targetTime: string; // "HH:mm" local
    capacity: number;
    daysOfWeek: number[]; // 1..7
    activeFrom?: string | null;
    activeTo?: string | null;
    defaultDriverId?: UUID | null;
    defaultVehicle?: string | null;
}

export interface ResidenceWeekPlanDto {
    studentId: UUID | 'me';
    weekStartDate: string; // YYYY-MM-DD
    nights: { date: string; confirmedPresent: boolean }[];
}

export interface TransportWeekPlanDto {
    studentId: UUID | 'me';
    weekStartDate: string; // YYYY-MM-DD
    entries: { templateId: UUID; date: string; direction: TransportDirection }[];
}

export interface TransportRunAssignmentDto {
    studentId: UUID;
    status: TransportAssignmentStatus;
    source: 'WEEK_PLAN' | 'ADMIN';
}

export interface TransportPresenceDto {
    studentId: UUID;
    mark?: PresenceMark | null;
    notes?: string | null;
}

export interface TransportRunDto {
    id: UUID;
    templateId: UUID;
    date: string; // YYYY-MM-DD
    plannedTime: string; // ISO UTC
    status: TransportRunStatus;
    vehicle?: string | null;
    driverId?: UUID | null;
    assignments: TransportRunAssignmentDto[];
    presences: TransportPresenceDto[];
    template?: Pick<TransportTemplateDto, 'name' | 'direction' | 'destinationId'>;
}
