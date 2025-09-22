import { ActivatedRouteSnapshot } from '@angular/router';

export function getValueFromRouteTree(
    route: ActivatedRouteSnapshot,
    key: string,
    source: 'params' | 'queryParams' | 'data' = 'params'
): string | any | null {
    let current: ActivatedRouteSnapshot | null = route;
    while (current) {
        switch (source) {
            case 'params':
                if (current.paramMap.has(key)) return current.paramMap.get(key);
                break;
            case 'queryParams':
                if (current.queryParamMap.has(key))
                    return current.queryParamMap.get(key);
                break;
            case 'data':
                if (key in current.data) return current.data[key];
                break;
        }
        current = current.parent;
    }
    return null;
}
