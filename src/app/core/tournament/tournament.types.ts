// tournament.types.ts
export type UUID = string;

/**
 * Tournament type enum
 */
export enum TournamentType {
    P250 = 'P250',
    P500 = 'P500',
    P1000 = 'P1000',
    P1500 = 'P1500',
    P2000 = 'P2000',
}

/**
 * Tournament status
 */
export enum TournamentStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

/**
 * Participation status for tournament participants
 */
export enum ParticipationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DECLINED = 'DECLINED',
}

/**
 * Address model (not used in main Tournament, kept for reference)
 */
export interface Address {
    line1: string;
    line2?: string | null;
    postalCode: string;
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
}

/**
 * Team member model
 */
export interface TeamMember {
    id: UUID;
    userId: UUID;
    teamId: UUID;
    user?: {
        id: UUID;
        firstname: string;
        lastname: string;
        email: string;
        currentRanking?: number | null;
    };
    currentRanking?: number | null;
    position?: number; // Position in the team (0 or 1 for doubles)
}

/**
 * Team model
 */
export interface Team {
    id: UUID;
    tournamentId: UUID;
    name?: string | null;
    position: number; // Order in the tournament
    placement?: number | null; // Final placement (1st, 2nd, etc.)
    members: TeamMember[];
}

/**
 * Tournament participant
 */
export interface TournamentParticipant {
    id: UUID;
    tournamentId: UUID;
    userId: UUID;
    user?: {
        id: UUID;
        firstname: string;
        lastname: string;
        email: string;
        currentRanking?: number | null;
    };
    status?: ParticipationStatus | null;
    feedback?: string | null;
    currentRanking?: number | null;
    createdAt: Date | string;
}

/**
 * Tournament model
 */
export interface Tournament {
    id: UUID;
    title: string;
    type: TournamentType;
    status: TournamentStatus;

    // Address fields (flattened)
    addressLine1: string;
    addressLine2?: string | null;
    postalCode: string;
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;

    // Dates
    startsAt: Date | string;
    endsAt: Date | string;

    // Participants and teams
    participants?: TournamentParticipant[];
    teams?: Team[];

    // Timestamps
    createdAt: Date | string;
    updatedAt?: Date | string | null;
}

/**
 * Tournament filters for querying
 */
export interface TournamentFilters {
    status?: TournamentStatus | null;
    type?: TournamentType | null;
    startDate?: string | null;
    endDate?: string | null;
    q?: string | null; // Search query
}

/**
 * Create tournament request
 */
export interface CreateTournamentRequest {
    title: string;
    type: TournamentType;
    addressLine1: string;
    addressLine2?: string | null;
    postalCode: string;
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    startsAt: string; // ISO date string
    endsAt: string; // ISO date string
}

/**
 * Update tournament request
 */
export interface UpdateTournamentRequest {
    title?: string;
    type?: TournamentType;
    status?: TournamentStatus;
    addressLine1?: string;
    addressLine2?: string | null;
    postalCode?: string;
    city?: string;
    country?: string;
    latitude?: number | null;
    longitude?: number | null;
    startsAt?: string; // ISO date string
    endsAt?: string; // ISO date string;
}

/**
 * Replace participants request
 */
export interface ReplaceParticipantsRequest {
    userIds: string[];
}

/**
 * Reorder teams request
 */
export interface ReorderTeamsRequest {
    teamOrder: string[];
}

/**
 * Set team placement request
 */
export interface SetTeamPlacementRequest {
    placement: number | null;
}

/**
 * RSVP request
 */
export interface TournamentRsvpRequest {
    status: ParticipationStatus;
}

/**
 * Feedback request
 */
export interface TournamentFeedbackRequest {
    feedback: string;
}

/**
 * User lookup result
 */
export interface UserLookupItem {
    id: UUID;
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
    currentRanking?: number | null;
}

export interface UserLookupDto {
    items: UserLookupItem[];
    total: number;
    page: number;
    pageSize: number;
}
