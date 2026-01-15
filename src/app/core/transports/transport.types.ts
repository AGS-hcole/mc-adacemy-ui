// transport.types.ts
export type UUID = string;

/**
 * Days of the week enum
 */
export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

/**
 * Transport occurrence status
 */
export enum TransportOccurrenceStatus {
    SCHEDULED = 'SCHEDULED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

/**
 * Transport booking status
 */
export enum TransportBookingStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

/**
 * Transport template model (Admin manages these)
 */
export interface TransportTemplate {
    id: UUID;
    name: string;
    description?: string | null;
    fromLabel: string;
    toLabel: string;
    daysOfWeek: DayOfWeek[];
    timeOfDay: string; // HH:mm format
    capacity: number;
    allowOverbook: boolean;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt?: Date | string | null;
}

/**
 * Transport occurrence (generated from template)
 */
export interface TransportOccurrence {
    id: UUID;
    templateId: UUID;
    template?: {
        id: UUID;
        name: string;
        fromLabel: string;
        toLabel: string;
        capacity: number;
        allowOverbook: boolean;
    };
    departureAt: Date | string;
    status: TransportOccurrenceStatus;
    bookedSeats: number;
    capacitySnapshot: number;
    allowOverbookSnapshot: boolean;
    availableSeats: number;
    myBooking?: TransportBooking | null;
    bookings?: TransportBooking[];
    cancellationReason?: string | null;
    createdAt: Date | string;
    updatedAt?: Date | string | null;
}

/**
 * Transport booking model
 */
export interface TransportBooking {
    id: UUID;
    occurrenceId: UUID;
    userId: UUID;
    user?: {
        id: UUID;
        firstname: string;
        lastname: string;
        email: string;
        fullName?: string;
    } | null;
    seats: number;
    status: TransportBookingStatus;
    createdAt: Date | string;
    updatedAt?: Date | string | null;
}

/**
 * Create template request
 */
export interface CreateTransportTemplateRequest {
    name: string;
    description?: string | null;
    fromLabel: string;
    toLabel: string;
    daysOfWeek: DayOfWeek[];
    timeOfDay: string; // HH:mm format
    capacity: number;
    allowOverbook?: boolean;
    isActive?: boolean;
}

/**
 * Update template request
 */
export interface UpdateTransportTemplateRequest {
    name?: string;
    description?: string | null;
    fromLabel?: string;
    toLabel?: string;
    daysOfWeek?: DayOfWeek[];
    timeOfDay?: string;
    capacity?: number;
    allowOverbook?: boolean;
    isActive?: boolean;
}

/**
 * Generate occurrences request
 */
export interface GenerateOccurrencesRequest {
    fromDate: string; // ISO date string (YYYY-MM-DD)
    toDate: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Book occurrence request
 */
export interface BookOccurrenceRequest {
    seats?: number; // Default 1 on frontend
}

/**
 * Cancel occurrence request
 */
export interface CancelOccurrenceRequest {
    reason?: string | null;
}

/**
 * Template filters for querying
 */
export interface TransportTemplateFilters {
    search?: string | null;
    page?: number;
    size?: number;
    isActive?: boolean | null;
}

/**
 * Occurrence filters for querying
 */
export interface TransportOccurrenceFilters {
    from?: string | null; // ISO date string
    to?: string | null; // ISO date string
    templateId?: UUID | null;
    status?: TransportOccurrenceStatus | null;
}

/**
 * Template list response with pagination
 */
export interface TransportTemplateListResponse {
    templates: TransportTemplate[];
    total: number;
    page: number;
    size: number;
}

/**
 * Occurrence list response
 */
export interface TransportOccurrenceListResponse {
    occurrences: TransportOccurrence[];
    total: number;
}
