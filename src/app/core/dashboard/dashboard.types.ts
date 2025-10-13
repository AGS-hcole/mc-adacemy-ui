export interface DashboardStats {
    sites: {
        total: number;
    };
    users: {
        total: number;
        admins: number;
        regularUsers: number;
    };
    sessions: {
        active: number;
    };
    tournaments: {
        upcoming: number;
    };
}
