// src/app/core/helpers/router-error-handler.ts
import { Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';

export function handleResolverError<T>(
    error: any,
    state: RouterStateSnapshot,
    router: Router
): Observable<T> {
    // Log the error
    console.error(error);

    // Get the parent url
    const parentUrl = state.url.split('/').slice(0, -1).join('/');

    // Navigate to there
    router.navigateByUrl(parentUrl);

    // Throw an error
    return throwError(error);
}
