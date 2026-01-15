import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { TransportsService } from 'app/core/transports/transports.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { DateTime } from 'luxon';
import { catchError } from 'rxjs';
import { AdminTransportTemplateInfoComponent } from './info/info.component';
import { AdminTransportsListComponent } from './list/list.component';
import { AdminTransportTemplateParticipantsComponent } from './participants/participants.component';
import { AdminTransportTemplateComponent } from './view/view.component';

/**
 * Transport templates resolver
 */
const templatesResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const transportsService = inject(TransportsService);
    const router = inject(Router);

    return transportsService
        .getTemplates({ isActive: true })
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

/**
 * Transport template resolver
 */
const templateResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const transportsService = inject(TransportsService);
    const router = inject(Router);

    return transportsService
        .getTemplateById(route.paramMap.get('templateId'))
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: AdminTransportsListComponent,
        resolve: {
            templates: templatesResolver,
        },
    },
    {
        path: ':templateId',
        component: AdminTransportTemplateComponent,
        resolve: {
            template: templateResolver,
        },
        children: [
            {
                path: '',
                redirectTo: 'info',
                pathMatch: 'full',
            },
            {
                path: 'info',
                component: AdminTransportTemplateInfoComponent,
            },
            {
                path: 'participants',
                component: AdminTransportTemplateParticipantsComponent,
            },
        ],
    },
] as Routes;
