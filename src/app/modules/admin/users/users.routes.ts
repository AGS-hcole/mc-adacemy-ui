import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { UsersDetailsComponent } from './details/details.component';
import { UsersListComponent } from './list/list.component';
import { UsersComponent } from './users.component';
import { UsersService } from './users.service';

/**
 * User resolver
 *
 * @param route
 * @param state
 */
const userResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const usersService = inject(UsersService);
    const router = inject(Router);

    return usersService.getUserById(route.paramMap.get('id')).pipe(
        // Error here means the requested user is not available
        catchError((error) => handleResolverError(error, state, router))
    );
};

/**
 * Users resolver
 *
 * @param route
 * @param state
 */
const usersResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const usersService = inject(UsersService);
    const router = inject(Router);

    return usersService.getUsers().pipe(
        // Error here means the requested user is not available
        catchError((error) => handleResolverError(error, state, router))
    );
};

/**
 * Can deactivate users details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateUsersDetails = (
    component: UsersDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/users'
    // it means we are navigating away from the
    // users app
    if (!nextState.url.includes('/users')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another user...
    if (nextRoute.paramMap.get('id')) {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: '',
        component: UsersComponent,
        resolve: {
            roles: () => inject(UsersService).getRoles(),
        },
        children: [
            {
                path: '',
                component: UsersListComponent,
                resolve: {
                    users: usersResolver,
                },
                children: [
                    {
                        path: 'add',
                        component: UsersDetailsComponent,
                        resolve: {
                            user: () => inject(UsersService).resetUser(),
                        },
                        canDeactivate: [canDeactivateUsersDetails],
                    },
                    {
                        path: ':id',
                        component: UsersDetailsComponent,
                        resolve: {
                            user: userResolver,
                        },
                        canDeactivate: [canDeactivateUsersDetails],
                    },
                ],
            },
        ],
    },
] as Routes;
