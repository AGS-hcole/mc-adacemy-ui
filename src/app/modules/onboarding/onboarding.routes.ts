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
import { OnboardingShellComponent } from './onboarding-shell.component';

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

export const ONBOARDING_ROUTES: Routes = [
    {
        path: '',
        component: OnboardingShellComponent,
        resolve: {
            user: userResolver,
        },
    },
];
