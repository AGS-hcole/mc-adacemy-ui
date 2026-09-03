export interface ParentChild {
    id: string;
    firstname: string;
    lastname: string;
    displayName: string;
}

export interface ParentDashboardDto {
    childId: string;
    currentWeek: {
        from: string; // ISO date
        to: string; // ISO date
    };
    trainingSessions: number;
    trainingAvgRating: number | null;
    transportsUsed: number;
    manorNights: number;
    upcomingTournaments: number;
    doneTournaments: number;
}
