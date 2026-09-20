import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { SitesService } from 'app/core/sites/sites.service';
import { TrainingGroupsService } from 'app/core/training-group/training-groups.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { AdminTrainingGroupDetailsComponent } from './details/details.component';
import { AdminTrainingGroupsListComponent } from './list/list.component';

const trainingGroupsResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const trainingGroupsService = inject(TrainingGroupsService);
    const router = inject(Router);

    return trainingGroupsService
        .list()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

const trainingGroupResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const trainingGroupsService = inject(TrainingGroupsService);
    const router = inject(Router);
    const id = route.paramMap.get('id');

    if (!id) {
        return router.parseUrl('/admin/groups');
    }

    return trainingGroupsService
        .getById(id)
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

const sitesResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sitesService = inject(SitesService);
    const router = inject(Router);

    return sitesService
        .getSites()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: AdminTrainingGroupsListComponent,
        resolve: {
            trainingGroups: trainingGroupsResolver,
            sites: sitesResolver,
        },
    },
    {
        path: 'new',
        component: AdminTrainingGroupDetailsComponent,
        resolve: {
            sites: sitesResolver,
            trainingGroup: () => {
                inject(TrainingGroupsService).resetTrainingGroup();
                return null;
            },
        },
    },
    {
        path: ':id',
        component: AdminTrainingGroupDetailsComponent,
        resolve: {
            trainingGroup: trainingGroupResolver,
            sites: sitesResolver,
        },
    },
] as Routes;
