# Before & After Comparison: Resolver Refactoring

## Pattern Comparison

### Before: Manual Data Loading in Components

#### Routes (sites.routes.ts)
```typescript
export default [
    {
        path: '',
        component: AdminSitesListComponent,
        // No resolver - component loads data manually
    },
    {
        path: ':id',
        component: AdminSiteDetailsComponent,
        // No resolver - component loads data manually
    },
] as Routes;
```

#### Component (list.component.ts)
```typescript
ngOnInit(): void {
    this.sites$ = this._sitesService.sites$;
    
    // Manual data loading in component
    this._sitesService.getSites().subscribe();
    
    this.searchInputControl.valueChanges
        .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
        .subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });
}
```

### After: Resolver-Based Data Loading

#### Routes (sites.routes.ts)
```typescript
const sitesResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const sitesService = inject(SitesService);
    const router = inject(Router);

    return sitesService
        .getSites()
        .pipe(catchError((error) => handleResolverError(error, state, router)));
};

export default [
    {
        path: '',
        component: AdminSitesListComponent,
        resolve: {
            sites: sitesResolver,  // Data pre-loaded
        },
    },
    {
        path: ':id',
        component: AdminSiteDetailsComponent,
        resolve: {
            site: siteResolver,    // Data pre-loaded
            sites: sitesResolver,
        },
    },
] as Routes;
```

#### Component (list.component.ts)
```typescript
ngOnInit(): void {
    // Data already loaded by resolver
    this.sites$ = this._sitesService.sites$;
    
    this.searchInputControl.valueChanges
        .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
        .subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });
}
```

## Key Differences

| Aspect | Before | After |
|--------|--------|-------|
| **Data Loading** | In component `ngOnInit` | In route resolver |
| **Component Complexity** | Higher - handles loading | Lower - data pre-loaded |
| **Error Handling** | Per component | Centralized in resolver |
| **Loading States** | Component shows loading | Data available immediately |
| **Navigation** | Navigate then load | Load then navigate |
| **Consistency** | Varies by module | Uniform across app |

## Example: Profile Component

### Before
```typescript
ngOnInit(): void {
    // Subscribe directly to service
    this.userService.user$.subscribe(user => {
        if (user) {
            this.user = user;
            this.initializeForm(user);
            this.loadUserImages();
        }
    });
    
    this.initializeFeed();
}
```

### After
```typescript
ngOnInit(): void {
    // Get pre-resolved user data
    this._activatedRoute.data.subscribe(({ user }) => {
        if (user) {
            this.user = user;
            this.initializeForm(user);
            this.loadUserImages();
        }
    });
    
    this.initializeFeed();
}
```

## Benefits Visualization

### Before: Component-Based Loading
```
User clicks link
    ↓
Component loads
    ↓
Component visible (empty/loading state)
    ↓
Component requests data
    ↓
Data arrives
    ↓
Component updates with data
```

### After: Resolver-Based Loading
```
User clicks link
    ↓
Resolver requests data
    ↓
Data arrives
    ↓
Component loads with data
    ↓
Component visible (with data)
```

## Modules Updated

1. ✅ **admin/sites** - Added resolvers for list and detail views
2. ✅ **user/profile** - Added resolver for user data
3. ✅ **onboarding** - Added resolver for user data
4. ℹ️ **admin/reports** - Uses state service (no change needed)
5. ✅ **admin/sessions** - Already had resolvers (no change)
6. ✅ **admin/users** - Already had resolvers (no change)
7. ✅ **user/sessions** - Already had resolvers (no change)

## Error Handling Pattern

All resolvers use the same error handling approach:

```typescript
.pipe(catchError((error) => handleResolverError(error, state, router)))
```

The `handleResolverError` helper:
- Logs the error
- Navigates to parent URL
- Re-throws the error for further handling if needed

This provides consistent error behavior across all routes.
