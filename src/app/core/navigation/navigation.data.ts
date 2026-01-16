/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

/**
 * Common Navigation
 */
export const commonNavigation: FuseNavigationItem[] = [
    {
        id: 'common',
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
            {
                id: 'sites',
                title: 'NAVIGATION.ADMIN.SITES.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:map-pin',
                link: '/admin/sites',
            },
            {
                id: 'sessions',
                title: 'NAVIGATION.ADMIN.SESSIONS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/admin/sessions',
            },
            {
                id: 'transports',
                title: 'NAVIGATION.ADMIN.TRANSPORTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:truck',
                link: '/admin/transports',
            },
            {
                id: 'tournaments',
                title: 'NAVIGATION.ADMIN.TOURNAMENTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:trophy',
                link: '/admin/tournaments',
            },
            {
                id: 'events',
                title: 'NAVIGATION.ADMIN.EVENTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/admin/events',
            },
            {
                id: 'reports',
                title: 'NAVIGATION.ADMIN.REPORTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:chart-bar',
                link: '/admin/reports',
            },
            {
                id: 'manors',
                title: 'NAVIGATION.ADMIN.MANORS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:building-office-2',
                link: '/admin/manors',
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
            {
                id: 'transports',
                title: 'NAVIGATION.USER.TRANSPORTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:truck',
                link: '/user/transports',
            },
            {
                id: 'tournaments',
                title: 'NAVIGATION.USER.TOURNAMENTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:trophy',
                link: '/user/tournaments',
            },
            {
                id: 'my-nights',
                title: 'NAVIGATION.USER.MY_NIGHTS.TITLE',
                type: 'basic',
                icon: 'heroicons_outline:moon',
                link: '/user/my-nights',
            },
        ],
    },
];
