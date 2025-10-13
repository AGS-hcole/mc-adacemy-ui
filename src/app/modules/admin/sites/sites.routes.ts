import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { SitesService } from 'app/core/sites/sites.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { AdminSiteDetailsComponent } from './details/details.component';
import { AdminSitesListComponent } from './list/list.component';

/**
 * Sites resolver
 */
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

/**
 * Site resolver
 */
const siteResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sitesService = inject(SitesService);
    const router = inject(Router);

    return sitesService
        .getSiteById(route.paramMap.get('id'))
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: AdminSitesListComponent,
        resolve: {
            sites: sitesResolver,
        },
    },
    {
        path: 'new',
        component: AdminSiteDetailsComponent,
        resolve: {
            site: () => {
                inject(SitesService).resetSite();
                return null;
            },
        },
    },
    {
        path: ':id',
        component: AdminSiteDetailsComponent,
        resolve: {
            site: siteResolver,
            sites: sitesResolver,
        },
    },
] as Routes;
