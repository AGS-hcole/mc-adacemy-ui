/**
 * Social feature types
 */

/**
 * Type of social target entity
 */
export type SocialTargetType = 'SESSION' | 'TOURNAMENT'; // Extend later if needed

/**
 * Response from like/unlike API
 */
export interface SocialLikeResponse {
    targetId: string;
    likesCount: number;
    userHasLiked: boolean;
}

/**
 * Comment on a social target entity
 */
export interface SocialComment {
    id: string;
    targetId: string;
    userId: string;
    fullName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    parentId?: string | null;
}

/**
 * Paginated response for comments
 */
export interface SocialCommentPage {
    items: SocialComment[];
    nextCursor: string | null;
    hasMore: boolean;
}
