export type ContractScope = 'all' | 'under' | 'off';
export type PeriodPreset = 'last7' | 'last30' | 'thisMonth' | 'prevMonth' | 'custom';

export interface ReportsFilters {
    from: string; // ISO date
    to: string; // ISO date
    userId?: string;
    contractScope: ContractScope;
    preset: PeriodPreset;
    page: number;
    pageSize: number;
    sort: string;
}

export interface SessionsSummaryDto {
    period: {
        from: string;
        to: string;
        timezone: string;
    };
    totals: {
        sessions: number;
        underContract: number;
        offContract: number;
        uniqueUsers: number;
    };
}

export interface TimeBucket {
    date: string;
    total: number;
    underContract: number;
    offContract: number;
}

export interface SessionsTimeseriesDto {
    buckets: TimeBucket[];
}

export type SessionStatus = 'SCHEDULED' | 'DONE' | 'CANCELLED';
export type SessionContractType = 'UNDER' | 'OFF';

export interface SessionListItem {
    id: string;
    date: string; // ISO
    title: string;
    coachName?: string;
    contractType: SessionContractType;
    attendeesCount: number;
    status: SessionStatus;
}

export interface SessionsListDto {
    items: SessionListItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface UserLookupItem {
    id: string;
    name: string;
    email: string;
}

export interface UsersLookupDto {
    items: UserLookupItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface UserRatingStats {
    userId: string;
    userName: string;
    userAvatar?: string;
    average: number;
    count: number;
}

export interface RatingsSummaryDto {
    period: {
        from: string;
        to: string;
        timezone: string;
    };
    global: {
        average: number;
        count: number;
        ratedSessions: number;
        unratedSessions: number;
        distribution: number[]; // Array of 11 elements (0-10), count per score
    };
    byContract: {
        withContract: number;
        withoutContract: number;
    };
    perUser: UserRatingStats[];
    topUsers: UserRatingStats[];
    bottomUsers: UserRatingStats[];
}
