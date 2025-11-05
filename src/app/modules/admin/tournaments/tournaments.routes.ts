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
import { TournamentInfoComponent } from './info/info.component';
import { TournamentLineupsComponent } from './lineups/lineups.component';
import { TournamentListComponent } from './list/list.component';
import { TournamentParticipantsComponent } from './participants/participants.component';
import { TournamentViewComponent } from './view/view.component';

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
    const tournamentId =
        route.paramMap.get('id') || route.parent?.paramMap.get('id');

    return tournamentsService
        .getById(tournamentId)
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
        component: TournamentInfoComponent,
        resolve: {
            tournament: () => inject(TournamentsService).resetTournament(),
        },
    },
    {
        path: ':id',
        component: TournamentViewComponent,
        resolve: {
            tournament: tournamentResolver,
        },
        children: [
            {
                path: '',
                redirectTo: 'info',
                pathMatch: 'full',
            },
            {
                path: 'info',
                component: TournamentInfoComponent,
            },
            {
                path: 'participants',
                component: TournamentParticipantsComponent,
            },
            {
                path: 'lineups',
                component: TournamentLineupsComponent,
            },
        ],
    },
] as Routes;
