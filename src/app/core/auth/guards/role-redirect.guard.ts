import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoleRedirectGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router
    ) {}

    canActivate(): Observable<UrlTree> {
        return this.userService.user$.pipe(
            take(1),
            map((user) => {
                if (!user) {
                    return this.router.parseUrl('/sign-in');
                }

                console.log(user.role);

                return this.router.parseUrl(`${user.role}/dashboard`);
            }),
            catchError(() => of(this.router.parseUrl('/sign-in')))
        );
    }
}
