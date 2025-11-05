export interface PublicEvent {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    startTime?: string | null; // ISO
    endTime?: string | null; // ISO
    backgroundImageUrl?: string | null;
    externalRegistrationUrl?: string | null;
    isPublished: boolean;
    orderIndex: number;
    isActive: boolean; // computed by backend
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
}
