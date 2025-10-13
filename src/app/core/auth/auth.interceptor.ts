import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, throwError } from 'rxjs';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    const hasToken =
        !!authService.accessToken &&
        !AuthUtils.isTokenExpired(authService.accessToken);

    // Build headers safely
    let headers = req.headers;

    // Add Authorization if available
    if (hasToken) {
        headers = headers.set(
            'Authorization',
            `Bearer ${authService.accessToken}`
        );
    }

    // If body is FormData, DO NOT set Content-Type (browser will set boundary)
    const isMultipart = req.body instanceof FormData;

    if (isMultipart) {
        // Make sure we don't accidentally keep a stale Content-Type
        if (headers.has('Content-Type')) {
            headers = headers.delete('Content-Type');
        }
    } else {
        // For non-FormData:
        // - Do NOT force Content-Type. Angular sets it to application/json automatically
        //   when the body is an object. Leaving it unset avoids breaking other cases.
        // - If you *really* need to enforce JSON for specific cases,
        //   do it conditionally and never override an existing header.
        // Example (commented out on purpose):
        // if (!headers.has('Content-Type') && req.body != null) {
        //     headers = headers.set('Content-Type', 'application/json');
        // }
    }

    const newReq = req.clone({ headers });

    return next(newReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                authService.signOut();
                location.reload();
            }
            return throwError(() => error);
        })
    );
};
