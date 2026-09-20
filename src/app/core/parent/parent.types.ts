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
    email?: string;
}

export interface ParentDashboardChildStats {
    child: ParentDashboardChild;
    metrics: {
        averageTrainingRating: number | null;
        residenceNightsDone: number;
        tournamentsDone: number;
        tournamentsUpcoming: number;
        trainingSessionsDone: number;
        transportsDone: number;
    };
}

export interface ParentDashboardPeriod {
    startDate: string; // ISO date
    endDate: string; // ISO date
    timezone: string;
}

export interface ParentDashboardDto {
    children: ParentDashboardChildStats[];
    period: ParentDashboardPeriod;
}
