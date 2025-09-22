import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    constructor(private http: HttpClient) {}

    loadSvg(url: string): Observable<string> {
        return this.http.get(url, { responseType: 'text' });
    }
}
