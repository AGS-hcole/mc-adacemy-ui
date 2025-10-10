import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { SessionsService } from 'app/core/session/sessions.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { UserSessionsListComponent } from './list/list.component';

/** Upcoming sessions resolver
 */
const sessionsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sessionsService = inject(SessionsService);
    const router = inject(Router);

    return sessionsService
        .getUpcomingSessions()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: UserSessionsListComponent,
        resolve: {
            sessions: sessionsResolver,
        },
    },
] as Routes;
