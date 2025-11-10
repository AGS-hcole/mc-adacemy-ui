import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { DashboardService } from 'app/core/dashboard/dashboard.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { DashboardComponent } from './dashboard/dashboard.component';

/** Stats resolver
 */
const statsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const dashboardService = inject(DashboardService);
    const router = inject(Router);

    return dashboardService
        .getDashboardStats()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        resolve: {
            stats: statsResolver,
        },
    },
    {
        path: 'profile',
        loadChildren: () => import('app/modules/user/profile/profile.routes'),
    },
    {
        path: 'sessions',
        loadChildren: () => import('app/modules/user/sessions/sessions.routes'),
    },
    {
        path: 'tournaments',
        loadChildren: () =>
            import('app/modules/user/tournaments/tournaments.routes'),
    },
    {
        path: 'planning',
        loadChildren: () => import('app/modules/user/planning/planning.routes').then(m => m.PLANNING_ROUTES),
    },
] as Routes;
