import { Routes } from '@angular/router';
import { ParentDashboardComponent } from './dashboard/parent-dashboard.component';
import { ParentReportsComponent } from './reports/parent-reports.component';

export default [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: ParentDashboardComponent,
    },
    {
        path: 'reports',
        component: ParentReportsComponent,
    },
] as Routes;
