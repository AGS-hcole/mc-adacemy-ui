import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { handleResolverError } from 'app/shared/helpers/router-error-handler';
import { catchError } from 'rxjs';
import { ProfileComponent } from './profile.component';

/**
 * User resolver
 */
const userResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.user$.pipe(
        catchError((error) => handleResolverError(error, state, router))
    );
};

export default [
    {
        path: '',
        component: ProfileComponent,
        resolve: {
            user: userResolver,
        },
    },
] as Routes;
