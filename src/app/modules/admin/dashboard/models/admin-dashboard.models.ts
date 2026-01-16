import { SessionSlot } from 'app/core/session/session.types';
import {
    TransportBookingStatus,
    TransportOccurrenceStatus,
} from 'app/core/transports/transport.types';

export type UUID = string;

/**
 * Admin Dashboard API Response
 */
export interface AdminDashboardDto {
    date: string; // YYYY-MM-DD
    sessions: DashboardSessionDto[];
    manors: DashboardManorDto[];
    transports: DashboardTransportOccurrenceDto[];
}

/**
 * Session with participants and ratings
 */
export interface DashboardSessionDto {
    id: UUID;
    siteId: UUID;
    site: {
        id: UUID;
        name: string;
        city?: string | null;
    };
    date: string; // YYYY-MM-DD
    slot: SessionSlot;
    startTime?: string | null; // HH:mm
    endTime?: string | null; // HH:mm
    isCanceled: boolean;
    participants: DashboardParticipantDto[];
}

/**
 * Participant with attendance and rating info
 */
export interface DashboardParticipantDto {
    userId: UUID;
    attendanceId: UUID;
    user: DashboardParticipantUserDto;
    status: 'YES' | 'NO';
    outOfContract: boolean;
    comment?: string | null;
    createdByAdmin: boolean;
    respondedAt: string;
    rating?: DashboardRatingDto | null;
}

/**
 * Participant User info
 */
export interface DashboardParticipantUserDto {
    id: UUID;
    firstname: string;
    lastname: string;
}

/**
 * Rating information
 */
export interface DashboardRatingDto {
    id: UUID;
    score: number; // 0-10
    comment?: string | null;
}

/**
 * Manor with overnight stays
 */
export interface DashboardManorDto {
    id: UUID;
    name: string;
    city?: string | null;
    capacity: number;
    enforceCapacity: boolean;
    stays: DashboardStayDto[];
}

/**
 * Stay information for a user
 */
export interface DashboardStayDto {
    id: UUID;
    userId: UUID;
    firstname: string;
    lastname: string;
    status: 'PLANNED' | 'CANCELED';
    overCapacity: boolean;
    createdByAdmin: boolean;
}

/**
 * Transport occurrence with bookings
 */
export interface DashboardTransportOccurrenceDto {
    id: UUID;
    templateId: UUID;
    templateName: string;
    fromLabel: string;
    toLabel: string;
    departureTime: string; // HH:mm
    status: TransportOccurrenceStatus;
    capacitySnapshot: number;
    bookings: DashboardBookingDto[];
}

/**
 * Booking information for a user
 */
export interface DashboardBookingDto {
    id: UUID;
    userId: UUID;
    firstname: string;
    lastname: string;
    seats: number;
    status: TransportBookingStatus;
}
