import { Routes } from '@angular/router';
import { TransportRunsComponent } from './transport-runs/transport-runs.component';
import { TransportTemplatesComponent } from './transport-templates/transport-templates.component';

export const PLANNING_ROUTES: Routes = [
    {
        path: 'transport-templates',
        component: TransportTemplatesComponent,
    },
    {
        path: 'transport-runs',
        component: TransportRunsComponent,
    },
];
