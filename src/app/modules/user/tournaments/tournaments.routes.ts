import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { UserTournamentDetailsComponent } from './details/details.component';
import { UserTournamentListComponent } from './list/list.component';

/**
 * User tournaments resolver
 */
const userTournamentsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const tournamentsService = inject(TournamentsService);
    const router = inject(Router);

    return tournamentsService
        .listMine('all')
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/**
 * Tournament details resolver
 */
const tournamentDetailsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const tournamentsService = inject(TournamentsService);
    const router = inject(Router);

    return tournamentsService
        .getById(route.paramMap.get('id'))
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: UserTournamentListComponent,
        resolve: {
            tournaments: userTournamentsResolver,
        },
    },
    {
        path: ':id',
        component: UserTournamentDetailsComponent,
        resolve: {
            tournament: tournamentDetailsResolver,
        },
    },
] as Routes;
