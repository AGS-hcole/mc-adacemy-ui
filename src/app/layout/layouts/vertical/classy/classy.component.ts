import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import {
    FuseNavigationItem,
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TranslocoService } from '@jsverse/transloco';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { Role, User } from 'app/core/user/user.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        UserComponent,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        LanguagesComponent,
        FuseFullscreenComponent,
        RouterOutlet,
        LogoComponent,
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    avatarUrl: string | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _route: ActivatedRoute
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;

                // Set avatar URL if user exists
                if (user) {
                    this.avatarUrl = this._userService.getAvatarUrl();
                }
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Set the current Navigation
        this.setCurrentNavigation();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                name
            );

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    /**
     * Handle avatar error (when avatar is not found)
     */
    onAvatarError(): void {
        this.avatarUrl = null;
        this._changeDetectorRef.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the current navigation
     *
     * @param selectedProduct
     */
    private setCurrentNavigation() {
        // Get the navigation
        const navigation =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                'mainNavigation'
            );

        // Clone the navigation object to avoid modifying the original
        const clonedNavigation = JSON.parse(JSON.stringify(this.navigation));

        // Translate the titles and subtitles and set the params
        this.prepareNavigation(clonedNavigation);

        if (navigation) {
            switch (this.user.role) {
                case Role.admin:
                    navigation.navigation = clonedNavigation.admin;
                    break;
                case Role.user:
                    navigation.navigation = clonedNavigation.user;
                    break;
                default:
                    navigation.navigation = clonedNavigation.user;
                    break;
            }

            // Refresh the navigation
            navigation.refresh();
        }
    }

    /**
     * Prepare each product's Navigation
     * @param module
     */
    private prepareNavigation(navigation: Navigation) {
        this.translateAndSetParams(navigation.user);
        this.translateAndSetParams(navigation.admin);
    }

    /**
     * Translate the titles and subtitles of the navigation items
     * and set the params in the links if they contain :groupId
     * @param navItems
     */
    private translateAndSetParams(navItems: FuseNavigationItem[]) {
        navItems.forEach((item) => {
            // Translate the title and subtitle
            item.title = this._translocoService.translate(item.title);
            item.subtitle = this._translocoService.translate(item.subtitle);

            // Set the params in the link
            if (item.link) {
                const scope = this.user?.role === Role.admin ? 'admin' : 'user';

                item.link = this.replaceRouteParams(item.link, { scope });
            }

            // Check recursively if the item has children
            if (item.children && item.children.length > 0) {
                this.translateAndSetParams(item.children);
            }
        });
    }

    /**
     * Replace the route parameters in the link with their values
     * from the current route or the provided params
     * @param link
     * @param params
     * @returns
     */
    private replaceRouteParams(
        link: string,
        params?: Record<string, string | null>
    ): string {
        // Determine the regex to match the parameters in the link
        const paramRegex = /:([a-zA-Z0-9_-]+)/g;

        if (!params) return link;

        // Remplace chaque paramètre dynamique par sa valeur
        return link.replace(paramRegex, (_, paramName) => {
            // Use the provided params or get the value from the current route
            const paramValue =
                params?.[paramName] ||
                this._route.snapshot.paramMap.get(paramName);

            // If the paramValue is not found, return the paramName with a colon
            return paramValue ? paramValue : `:${paramName}`;
        });
    }
}
