import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { Role } from 'app/core/user/user.types';
import { Observable, catchError, map, of, take } from 'rxjs';

/**
 * Guard that restricts access to routes based on allowed roles.
 * Usage: add `data: { roles: [Role.admin] }` to the route.
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(
        private _userService: UserService,
        private _router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        const allowedRoles: Role[] = route.data?.['roles'] ?? [];

        return this._userService.user$.pipe(
            take(1),
            map((user) => {
                if (!user) {
                    return this._router.parseUrl('/sign-in');
                }
                if (
                    allowedRoles.length > 0 &&
                    !allowedRoles.includes(user.role as Role)
                ) {
                    return this._router.parseUrl(`/${user.role}/dashboard`);
                }
                return true;
            }),
            catchError(() => of(this._router.parseUrl('/sign-in')))
        );
    }
}
