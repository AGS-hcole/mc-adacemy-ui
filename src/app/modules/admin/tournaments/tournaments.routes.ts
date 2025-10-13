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
import { TournamentEditComponent } from './edit/edit.component';
import { TournamentListComponent } from './list/list.component';

/**
 * Tournaments resolver
 */
const tournamentsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const tournamentsService = inject(TournamentsService);
    const router = inject(Router);

    return tournamentsService
        .list()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/**
 * Tournament resolver
 */
const tournamentResolver = (
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
        component: TournamentListComponent,
        resolve: {
            tournaments: tournamentsResolver,
        },
    },
    {
        path: 'new',
        component: TournamentEditComponent,
        resolve: {
            tournament: () => inject(TournamentsService).resetTournament(),
        },
    },
    {
        path: ':id',
        component: TournamentEditComponent,
        resolve: {
            tournament: tournamentResolver,
        },
    },
] as Routes;
