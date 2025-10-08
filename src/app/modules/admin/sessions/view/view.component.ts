import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Session } from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { Subject, takeUntil } from 'rxjs';
import { DatePipe, NgIf } from '@angular/common';

@Component({
    selector: 'sessions-view',
    templateUrl: './view.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatTabsModule,
        MatTooltipModule,
        TranslocoModule,
        DatePipe,
        NgIf,
    ],
})
export class SessionsViewComponent implements OnInit, OnDestroy {
    session: Session;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _sessionsService: SessionsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the session
        this._sessionsService.session$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((session: Session) => {
                this.session = session;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Go back to sessions list
     */
    goBack(): void {
        this._router.navigate(['../..'], { relativeTo: this._activatedRoute });
    }
}
