import { Routes } from '@angular/router';

export default [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'profile',
        loadChildren: () => import('app/modules/user/profile/profile.routes'),
    },
    {
        path: 'sessions',
        loadChildren: () => import('app/modules/user/sessions/sessions.routes'),
    },
] as Routes;
