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
                id: 'sites',
                title: 'NAVIGATION.ADMIN.SITES.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:map-pin',
                link: '/admin/sites',
            },
            {
                id: 'users',
                title: 'NAVIGATION.ADMIN.USERS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:user',
                link: '/admin/users',
            },
            {
                id: 'sessions',
                title: 'NAVIGATION.ADMIN.SESSIONS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/admin/sessions',
            },
            {
                id: 'tournaments',
                title: 'NAVIGATION.ADMIN.TOURNAMENTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:trophy',
                link: '/admin/tournaments',
                disabled: true,
                badge: {
                    title: 'Bientôt dispo',
                    classes: 'bg-gray-500 rounded-full px-2 text-white',
                },
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
                id: 'sessions',
                title: 'NAVIGATION.USER.SESSIONS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/user/sessions',
            },
        ],
    },
];
