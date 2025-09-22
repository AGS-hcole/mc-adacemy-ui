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
] as Routes;
