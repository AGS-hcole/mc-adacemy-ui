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
 * Public events resolver
 */
export const publicEventsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const eventsApi = inject(EventsApi);
    const router = inject(Router);

    return eventsApi
        .list({ page: 1, pageSize: 12, sort: 'order' })
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};
