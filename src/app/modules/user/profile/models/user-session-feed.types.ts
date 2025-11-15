import { SocialComment, SocialTargetType } from './social.types';

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
    
    // Social properties
    socialTargetType?: SocialTargetType;
    socialEntityId?: string;
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
    startTimeObj: Date;
    userStatusLabel: string;
    sessionTypeLabel: string;
    
    // UI-only state for comments and likes
    showComments?: boolean;
    isLiking?: boolean;
    isLoadingComments?: boolean;
    isSubmittingComment?: boolean;
    
    // Comments cache
    comments?: SocialComment[];
    commentsNextCursor?: string | null;
    hasMoreComments?: boolean;
}
