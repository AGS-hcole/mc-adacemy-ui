import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { DashboardService } from 'app/core/dashboard/dashboard.service';
import { DashboardStats } from 'app/core/dashboard/dashboard.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        TranslocoModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatInputModule,
        MatTooltipModule,
    ],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    stats: DashboardStats | null = null;

    /**
     * Constructor
     */
    constructor(
        private _dashboardService: DashboardService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Get the stats
        this._dashboardService.stats$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stats: DashboardStats) => {
                this.stats = stats;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to sessions registration
     */
    navigateToSessions(): void {
        this._router.navigate(['/user/sessions']);
    }

    /**
     * Navigate to tournaments registration
     */
    navigateToTournaments(): void {
        this._router.navigate(['/user/tournaments']);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
