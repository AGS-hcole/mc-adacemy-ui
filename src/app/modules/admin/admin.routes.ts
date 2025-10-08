import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export default [
    /**
     * Public routes
     */
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
        path: 'users',
        loadChildren: () => import('app/modules/admin/users/users.routes'),
    },
    {
        path: 'sessions',
        loadChildren: () => import('app/modules/admin/sessions/sessions.routes'),
    },
    {
        path: 'sites',
        loadChildren: () => import('app/modules/admin/sites/sites.routes'),
    },
] as Routes;
