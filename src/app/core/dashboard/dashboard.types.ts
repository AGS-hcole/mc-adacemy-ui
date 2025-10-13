export interface DashboardStats {
    sites: {
        total: number;
    };
    users: {
        total: number;
        admins: number;
        students: number;
    };
    sessions: {
        total: number;
        upcoming: number;
    };
    tournaments: {
        total: number;
        upcoming: number;
    };
}
