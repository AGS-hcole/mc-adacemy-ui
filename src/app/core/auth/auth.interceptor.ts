import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Build headers
    let headers = req.headers;

    const hasValidAccess =
        !!auth.accessToken && !AuthUtils.isTokenExpired(auth.accessToken);

    if (hasValidAccess) {
        headers = headers.set('Authorization', `Bearer ${auth.accessToken}`);
    }

    const isMultipart = req.body instanceof FormData;
    if (isMultipart && headers.has('Content-Type')) {
        headers = headers.delete('Content-Type');
    }

    const newReq = req.clone({ headers });

    return next(newReq).pipe(
        catchError((error) => {
            // If not 401, just propagate
            if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
                return throwError(() => error);
            }

            // Avoid refresh loops: if the failing call is the refresh/sign-in itself -> hard logout
            const url = req.url ?? '';
            const isAuthEndpoint =
                url.includes('/auth/refresh-token') ||
                url.includes('/auth/sign-in');

            if (isAuthEndpoint) {
                auth.signOut().subscribe(() =>
                    router.navigateByUrl('/sign-in')
                );
                return throwError(() => error);
            }

            // Try to refresh once, then replay original request
            return auth.refreshAccessToken().pipe(
                switchMap((newToken) => {
                    const retryReq = req.clone({
                        headers: req.headers.set(
                            'Authorization',
                            `Bearer ${newToken}`
                        ),
                    });
                    return next(retryReq);
                }),
                catchError((refreshErr) => {
                    // Refresh failed -> logout + redirect
                    auth.signOut().subscribe(() =>
                        router.navigateByUrl('/sign-in')
                    );
                    return throwError(() => refreshErr);
                })
            );
        })
    );
};
