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
import { AdminDashboardPageComponent } from './dashboard/admin-dashboard-page.component';

/** Stats resolver (kept for backward compatibility but not used by new dashboard)
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
        component: AdminDashboardPageComponent,
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
        path: 'transports',
        loadChildren: () =>
            import('app/modules/admin/transports/transports.routes'),
    },
    {
        path: 'sites',
        loadChildren: () => import('app/modules/admin/sites/sites.routes'),
    },
    {
        path: 'tournaments',
        loadChildren: () =>
            import('app/modules/admin/tournaments/tournaments.routes'),
    },
    {
        path: 'reports',
        loadChildren: () => import('app/modules/admin/reports/reports.routes'),
    },
    {
        path: 'events',
        loadChildren: () => import('app/modules/admin/events/events.routes'),
    },
    {
        path: 'manors',
        loadChildren: () => import('app/modules/admin/manors/manors.routes'),
    },
] as Routes;
