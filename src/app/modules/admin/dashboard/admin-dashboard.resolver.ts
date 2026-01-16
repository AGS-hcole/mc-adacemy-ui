import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { AdminDashboardService } from './services/admin-dashboard.service';

/**
 * Admin dashboard resolver
 * Loads dashboard data for today's date on initial navigation
 */
export const adminDashboardResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const dashboardService = inject(AdminDashboardService);
    const router = inject(Router);

    // Always load today's date on initial navigation
    const date = formatDateToYYYYMMDD(new Date());

    return dashboardService
        .getDashboard(date)
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/**
 * Format date to YYYY-MM-DD
 */
function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
