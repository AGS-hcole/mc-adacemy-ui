export interface ParentChild {
    id: string;
    firstname: string;
    lastname: string;
    displayName: string;
}

export interface ParentDashboardChild {
    id: string;
    firstname: string;
    lastname: string;
    birthDate: string;
}

export interface ParentDashboardChildStats {
    child: ParentDashboardChild;
    ratings: {
        average: number | null;
        count: number;
    };
    residence: {
        nightsCount: number;
    };
    tournaments: {
        completedCount: number;
        upcomingCount: number;
    };
    trainingSessions: {
        completedCount: number;
    };
    transports: {
        completedCount: number;
    };
}

export interface ParentDashboardPeriod {
    from: string; // ISO date
    to: string; // ISO date
    timezone: string;
}

export interface ParentDashboardDto {
    children: ParentDashboardChildStats[];
    period: ParentDashboardPeriod;
}
