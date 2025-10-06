import { Routes } from '@angular/router';

export default [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'sessions',
        loadChildren: () => import('app/modules/user/sessions/sessions.routes'),
    },
] as Routes;
