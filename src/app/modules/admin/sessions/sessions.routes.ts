import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { SessionsViewComponent } from './view/view.component';
import { SessionInfoComponent } from './info/info.component';
import { SessionParticipantsComponent } from './participants/participants.component';
import { AdminSessionsListComponent } from './list/list.component';
import { SessionsService } from 'app/core/session/sessions.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';

/**
 * Session resolver
 */
const sessionResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sessionsService = inject(SessionsService);
    const router = inject(Router);

    return sessionsService.getSessionById(route.paramMap.get('id')).pipe(
        catchError((error) => handleResolverError(error, state, router))
    );
};

export default [
    {
        path: '',
        component: AdminSessionsListComponent,
    },
    {
        path: ':id',
        component: SessionsViewComponent,
        resolve: {
            session: sessionResolver,
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
