import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Site } from 'app/core/session/session.types';
import { environment } from 'environments/environment';
import {
    BehaviorSubject,
    Observable,
    map,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SitesService {
    private apiUrl = environment.apiUrl;
    private _site: BehaviorSubject<Site | null> = new BehaviorSubject(null);
    private _sites: BehaviorSubject<Site[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for site
     */
    get site$(): Observable<Site> {
        return this._site.asObservable();
    }

    /**
     * Getter for sites
     */
    get sites$(): Observable<Site[]> {
        return this._sites.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all sites
     */
    getSites(): Observable<Site[]> {
        return this._httpClient.get<Site[]>(`${this.apiUrl}/sites`).pipe(
            tap((sites) => {
                this._sites.next(sites);
            })
        );
    }

    /**
     * Get site by id
     */
    getSiteById(id: string): Observable<Site> {
        return this._sites.pipe(
            take(1),
            map((sites) => {
                // Find the site
                const site = sites.find((item) => item.id === id) || null;

                // Update the site
                this._site.next(site);

                // Return the site
                return site;
            }),
            switchMap((site) => {
                if (!site) {
                    return throwError(
                        'Could not found site with id of ' + id + '!'
                    );
                }

                return of(site);
            })
        );
    }

    /**
     * Create site
     */
    createSite(site: Partial<Site>): Observable<Site> {
        return this.sites$.pipe(
            take(1),
            switchMap((sites) =>
                this._httpClient
                    .post<Site>(`${this.apiUrl}/sites`, site)
                    .pipe(
                        map((newSite) => {
                            // Update the sites with the new site
                            const updatedSites = sites || [];
                            this._sites.next([newSite, ...updatedSites]);

                            // Return the new site
                            return newSite;
                        })
                    )
            )
        );
    }

    /**
     * Update site
     */
    updateSite(id: string, site: Partial<Site>): Observable<Site> {
        return this.sites$.pipe(
            take(1),
            switchMap((sites) =>
                this._httpClient
                    .put<Site>(`${this.apiUrl}/sites/${id}`, site)
                    .pipe(
                        map((updatedSite) => {
                            if (sites) {
                                // Find the index of the updated site
                                const index = sites.findIndex(
                                    (item) => item.id === id
                                );

                                if (index !== -1) {
                                    // Update the site
                                    sites[index] = updatedSite;
                                    this._sites.next([...sites]);
                                }
                            }

                            // Update the current site if it matches
                            const currentSite = this._site.getValue();
                            if (currentSite && currentSite.id === id) {
                                this._site.next(updatedSite);
                            }

                            return updatedSite;
                        })
                    )
            )
        );
    }

    /**
     * Delete site
     */
    deleteSite(id: string): Observable<boolean> {
        return this.sites$.pipe(
            take(1),
            switchMap((sites) =>
                this._httpClient
                    .delete<void>(`${this.apiUrl}/sites/${id}`)
                    .pipe(
                        map(() => {
                            if (sites) {
                                // Find the index of the deleted site
                                const index = sites.findIndex(
                                    (item) => item.id === id
                                );

                                if (index !== -1) {
                                    sites.splice(index, 1);
                                    this._sites.next([...sites]);
                                }
                            }

                            return true;
                        })
                    )
            )
        );
    }

    /**
     * Reset the site observable
     */
    resetSite(): void {
        this._site.next(null);
    }
}
