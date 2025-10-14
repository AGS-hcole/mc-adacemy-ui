// session.types.ts
export type UUID = string;

/**
 * Session slot enum (AM or PM)
 */
export enum SessionSlot {
    AM = 'AM',
    PM = 'PM',
}

/**
 * Session status
 */
export enum SessionStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CANCELLED = 'CANCELLED',
}

/**
 * Site model
 */
export interface Site {
    id: UUID;
    name: string;
    address?: string;
    city?: string;
}

/**
 * Training session model
 * Supports both auto-generated sessions (with slot only) and manually created sessions (with explicit startTime/endTime)
 */
export interface Session {
    id: UUID;
    siteId: UUID;
    site?: Site; // Populated site details

    // Date and slot
    date: Date | string; // ISO date string
    slot: SessionSlot;

    // Optional explicit time ranges (for manual sessions)
    // If not provided, defaults apply: AM = 09:00-12:00, PM = 14:00-17:00
    startTime?: string | null; // HH:mm format
    endTime?: string | null; // HH:mm format

    // Metadata
    notes?: string | null;
    isPublished: boolean;
    isCanceled: boolean;

    // Attendees tracking
    maxAttendees?: number | null;
    currentAttendees?: number;
    attendances?: SessionAttendee[];

    // Timestamps
    createdAt: Date | string;
    updatedAt?: Date | string | null;
    createdByAdmin?: boolean;
}

/**
 * Session attendee (RSVP)
 */
export interface SessionAttendee {
    id: UUID;
    sessionId: UUID;
    userId: UUID;
    user?: {
        id: UUID;
        firstname: string;
        lastname: string;
        email: string;
        formula?: string | null;
    };

    status: 'YES' | 'NO';
    comment?: string | null;

    createdByAdmin: boolean;
    outOfContract: boolean;
    respondedAt: Date | string;

    createdAt?: Date | string;
    updatedAt?: Date | string | null;
}

/**
 * Session filters for querying
 */
export interface SessionFilters {
    siteId?: UUID | null;
    startDate?: string | null; // ISO date string
    endDate?: string | null; // ISO date string
    slot?: SessionSlot | null;
    isPublished?: boolean | null;
    isCanceled?: boolean | null;
}

/**
 * Create session request
 */
export interface CreateSessionRequest {
    siteId: UUID;
    date: string; // ISO date string (YYYY-MM-DD)
    slot: SessionSlot;
    startTime?: string | null; // HH:mm format
    endTime?: string | null; // HH:mm format
    notes?: string | null;
    isPublished?: boolean;
}

/**
 * Update session request
 */
export interface UpdateSessionRequest {
    siteId?: UUID;
    date?: string; // ISO date string (YYYY-MM-DD)
    slot?: SessionSlot;
    startTime?: string | null; // HH:mm format
    endTime?: string | null; // HH:mm format
    notes?: string | null;
    isPublished?: boolean;
    isCanceled?: boolean;
}

/**
 * RSVP request (user registration)
 */
export interface RsvpRequest {
    sessionId: UUID;
}

/**
 * Admin register request (override)
 */
export interface AdminRegisterRequest {
    sessionId: UUID;
    userId: UUID;
}

/**
 * Session list response with pagination
 */
export interface SessionListResponse {
    sessions: Session[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Default session times based on slot
 */
export const DEFAULT_SESSION_TIMES: Record<
    SessionSlot,
    { start: string; end: string }
> = {
    [SessionSlot.AM]: { start: '09:00', end: '12:00' },
    [SessionSlot.PM]: { start: '14:00', end: '17:00' },
};

/**
 * Rating model for session participants
 */
export interface Rating {
    id: UUID;
    sessionId: UUID;
    userId: UUID;
    raterId: UUID;
    score: number; // 0-10
    comment?: string | null;
    createdAt: Date | string;
    updatedAt?: Date | string | null;
    rater?: {
        id: UUID;
        firstname: string;
        lastname: string;
    };
}

/**
 * Rating statistics for a session
 */
export interface RatingStats {
    average: number;
    count: number;
    distribution: number[]; // Array of 11 elements (0-10), count per score
}

/**
 * Upsert rating request
 */
export interface UpsertRatingRequest {
    score: number; // 0-10
    comment?: string | null;
}

/**
 * Get ratings for session response
 */
export interface SessionRatingsResponse {
    ratings: Rating[];
    stats: RatingStats;
}
