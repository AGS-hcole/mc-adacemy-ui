/**
 * User session feed item from API
 */
export interface UserSessionFeedItem {
    sessionId: string;
    date: string; // ISO string from API
    slot?: string;
    siteId: string;
    siteName: string;
    sessionType: string;
    level?: string;
    userRating: number | null;
    averageRating: number | null;
    participantsCount: number;
    userStatus: string;
    startTime?: string; // ISO string for session start time
    likesCount?: number;
    commentsCount?: number;
    isLikedByUser?: boolean;
}

/**
 * API response for session feed with pagination
 */
export interface UserSessionFeedResponse {
    items: UserSessionFeedItem[];
    nextCursor: string | null;
    hasMore: boolean;
}

/**
 * View model for session feed item with computed properties
 */
export interface UserSessionFeedViewItem extends UserSessionFeedItem {
    dateObj: Date;
    userStatusLabel: string;
    sessionTypeLabel: string;
    showComments?: boolean; // UI state for showing comment section
}
