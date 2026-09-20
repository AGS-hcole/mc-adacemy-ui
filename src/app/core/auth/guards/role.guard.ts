import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { Role } from 'app/core/user/user.types';
import { catchError, map, of, take } from 'rxjs';

export const RoleGuard: CanActivateFn | CanActivateChildFn = (route) => {
    const userService = inject(UserService);
    const router = inject(Router);

    const allowedRoles: Role[] = route.data?.['roles'] ?? [];

    return userService.user$.pipe(
        take(1),
        map((user) => {
            if (!user) {
                return router.parseUrl('/sign-in');
            }

            if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(user.role as Role)
            ) {
                return router.parseUrl(`/${user.role}/dashboard`);
            }

            return true;
        }),
        catchError(() => of(router.parseUrl('/sign-in')))
    );
};
