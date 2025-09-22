/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

/**
 * Common Navigation
 */
export const commonNavigation: FuseNavigationItem[] = [
    {
        id: 'admin',
        title: 'NAVIGATION.TITLE',
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'NAVIGATION.DASHBOARD.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:home',
                link: '/:scope/dashboard',
            },
        ],
    },
];

/**
 * Admin Navigation
 */
export const adminNavigation: FuseNavigationItem[] = [
    {
        id: 'admin',
        title: 'NAVIGATION.ADMIN.TITLE',
        type: 'group',
        subtitle: 'NAVIGATION.ADMIN.SUBTITLE',
        children: [
            {
                id: 'users',
                title: 'NAVIGATION.ADMIN.USERS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:user',
                link: '/admin/users',
            },
        ],
    },
];

/**
 * User Navigation
 */
export const userNavigation: FuseNavigationItem[] = [
    {
        id: 'user',
        title: 'NAVIGATION.USER.TITLE',
        type: 'group',
        subtitle: 'NAVIGATION.USER.SUBTITLE',
        children: [
            {
                id: 'trainings',
                title: 'NAVIGATION.USER.TRAININGS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:check-badge',
                link: '/user/trainings',
            },
        ],
    },
];
