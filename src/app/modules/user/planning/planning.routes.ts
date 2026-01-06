import { Routes } from '@angular/router';
import { WeeklyPlanningPageComponent } from './my-week/my-week.component';

export const PLANNING_ROUTES: Routes = [
    {
        path: 'my-week',
        component: WeeklyPlanningPageComponent,
    },
];
