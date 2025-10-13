import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { map, Observable } from 'rxjs';

/**
 * Onboarding guard
 * - On /onboarding route: if mustOnboard === false, redirect to dashboard
 * - On other routes: if mustOnboard === true, redirect to /onboarding
 */
export const OnboardingGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const isOnboardingRoute = state.url.startsWith('/onboarding');
    
    // First, ensure we have the latest user data
    return authService.getMe().pipe(
        map(() => {
            const mustOnboard = authService.mustOnboard;
            
            if (isOnboardingRoute) {
                // User is trying to access /onboarding
                if (!mustOnboard) {
                    // Already onboarded, redirect to dashboard
                    return router.parseUrl('/');
                }
                // Allow access to onboarding
                return true;
            } else {
                // User is trying to access other routes
                if (mustOnboard) {
                    // Must complete onboarding first
                    return router.parseUrl('/onboarding');
                }
                // Allow access
                return true;
            }
        })
    );
};
