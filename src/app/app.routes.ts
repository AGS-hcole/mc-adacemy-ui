import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { OnboardingGuard } from 'app/core/auth/guards/onboarding.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { RoleRedirectGuard } from './core/auth/guards/role-redirect.guard';

export const appRoutes: Route[] = [
    // Redirect empty path to '/home'
    {
        path: '',
        pathMatch: 'full',
        canActivate: [RoleRedirectGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
    },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () =>
                    import(
                        'app/modules/auth/confirmation-required/confirmation-required.routes'
                    ),
            },
            {
                path: 'forgot-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/forgot-password/forgot-password.routes'
                    ),
            },
            {
                path: 'reset-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/reset-password/reset-password.routes'
                    ),
            },
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.routes'),
            },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-out',
                loadChildren: () =>
                    import('app/modules/auth/sign-out/sign-out.routes'),
            },
            {
                path: 'onboarding',
                canActivate: [OnboardingGuard],
                loadChildren: () =>
                    import('app/modules/onboarding/onboarding.routes').then(
                        (m) => m.ONBOARDING_ROUTES
                    ),
            },
        ],
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard, OnboardingGuard],
        canActivateChild: [AuthGuard, OnboardingGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            // Admin Routes
            {
                path: 'admin',
                loadChildren: () => import('app/modules/admin/admin.routes'),
            },

            // User Routes
            {
                path: 'user',
                loadChildren: () => import('app/modules/user/user.routes'),
            },

            // 404 & Catch all
            {
                path: '404-not-found',
                pathMatch: 'full',
                loadChildren: () =>
                    import(
                        'app/modules/pages/error/error-404/error-404.routes'
                    ),
            },
            { path: '**', redirectTo: '404-not-found' },
        ],
    },
];
