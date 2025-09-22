import { ActivatedRoute } from '@angular/router';

export function getDrawerDataFromDeepestRoute<T = any>(
    route: ActivatedRoute,
    key: string,
    fallback: T
): T {
    let current: ActivatedRoute | null = route;

    // Get down to the deepest child route
    while (current.firstChild) {
        current = current.firstChild;
    }

    // Traverse up the route tree to find the key in data
    while (current) {
        if (current.snapshot.data?.[key] !== undefined) {
            return current.snapshot.data[key];
        }
        current = current.parent;
    }

    return fallback;
}
