import { Routes } from '@angular/router';
import { ReportsDashboardComponent } from './dashboard/reports-dashboard.component';

export default [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: ReportsDashboardComponent,
    },
] as Routes;
