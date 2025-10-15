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

export type RatingDistribution = Record<
    '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10',
    number
>;

export interface UserBriefDto {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export interface GlobalRatingsDto {
    average: number | null;
    count: number;
    distribution: RatingDistribution;
    ratedSessions: number;
    unratedSessions: number;
}

export interface PerUserRatingDto {
    user: UserBriefDto;
    average: number;
    count: number;
}

export interface TopBottomUserDto {
    userId: string;
    average: number;
    count: number;
}

export interface ContractSplitDto {
    contractCount: number;
    nonContractCount: number;
}

export interface RatingsScopeDto {
    userId?: string;
    contractScope?: 'all' | 'contract' | 'noContract';
}

export interface RatingsPeriodDto {
    from: string;
    to: string;
}

export interface RatingsSummaryDto {
    period: RatingsPeriodDto;
    scope: RatingsScopeDto;
    global: GlobalRatingsDto;
    perUser?: PerUserRatingDto[];
    topUsers?: TopBottomUserDto[];
    bottomUsers?: TopBottomUserDto[];
    contractSplit: ContractSplitDto;
}
