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
        resolve: {
            stats: statsResolver,
        },
    },
    {
        path: 'users',
        loadChildren: () => import('app/modules/admin/users/users.routes'),
    },
    {
        path: 'sessions',
        loadChildren: () =>
            import('app/modules/admin/sessions/sessions.routes'),
    },
    {
        path: 'sites',
        loadChildren: () => import('app/modules/admin/sites/sites.routes'),
    },
    {
        path: 'reports',
        loadChildren: () => import('app/modules/admin/reports/reports.routes'),
    },
] as Routes;
