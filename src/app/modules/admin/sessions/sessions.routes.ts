import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { SessionsService } from 'app/core/session/sessions.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { DateTime } from 'luxon';
import { catchError } from 'rxjs';
import { SessionInfoComponent } from './info/info.component';
import { AdminSessionsListComponent } from './list/list.component';
import { SessionParticipantsComponent } from './participants/participants.component';
import { SessionsViewComponent } from './view/view.component';

/**
 * Sessions resolver
 */
const sessionsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sessionsService = inject(SessionsService);
    const router = inject(Router);

    // Default to today's date to load only current/upcoming sessions
    const startDate = DateTime.now().startOf('day').toISODate();

    return sessionsService
        .getSessions({ startDate })
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/**
 * Session resolver
 */
const sessionResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sessionsService = inject(SessionsService);
    const router = inject(Router);

    return sessionsService
        .getSessionById(route.paramMap.get('id'))
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/** Sites resolver
 */
const sitesResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sessionsService = inject(SessionsService);
    const router = inject(Router);

    return sessionsService
        .getSites()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: AdminSessionsListComponent,
        resolve: {
            sites: sitesResolver,
            sessions: sessionsResolver,
        },
    },
    {
        path: 'new',
        component: SessionInfoComponent,
        resolve: {
            sites: sitesResolver,
            session: () => inject(SessionsService).resetSession(),
        },
    },
    {
        path: ':id',
        component: SessionsViewComponent,
        resolve: {
            session: sessionResolver,
            sites: sitesResolver,
        },
        children: [
            {
                path: '',
                redirectTo: 'info',
                pathMatch: 'full',
            },
            {
                path: 'info',
                component: SessionInfoComponent,
            },
            {
                path: 'participants',
                component: SessionParticipantsComponent,
            },
        ],
    },
] as Routes;
