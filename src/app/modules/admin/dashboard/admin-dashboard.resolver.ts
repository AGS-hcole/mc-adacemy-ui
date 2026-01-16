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
 * Loads dashboard data for the current date or specified date
 */
export const adminDashboardResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const dashboardService = inject(AdminDashboardService);
    const router = inject(Router);

    // Get date from query params or use today
    const dateParam = route.queryParamMap.get('date');
    const date = dateParam || formatDateToYYYYMMDD(new Date());

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
