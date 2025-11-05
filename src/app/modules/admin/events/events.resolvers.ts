import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { EventsApi } from 'app/core/api/events.api';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';

/**
 * Admin events resolver
 */
export const adminEventsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const eventsApi = inject(EventsApi);
    const router = inject(Router);

    return eventsApi
        .listAdmin({ page: 1, pageSize: 20, sort: 'order' })
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/**
 * Admin event by id resolver
 */
export const adminEventByIdResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const eventsApi = inject(EventsApi);
    const router = inject(Router);
    const id = route.paramMap.get('id');

    if (!id) {
        return router.parseUrl('/admin/events');
    }

    return eventsApi
        .getById(id)
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};
