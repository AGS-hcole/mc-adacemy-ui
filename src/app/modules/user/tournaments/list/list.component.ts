import { NgClass, NgFor, NgIf } from '@angular/common';
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
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
    Tournament,
    TournamentStatus,
    TournamentType,
} from 'app/core/tournament/tournament.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user-tournament-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LocalizedDatePipe,
        NgClass,
        NgFor,
        NgIf,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        TranslocoModule,
    ],
})
export class UserTournamentListComponent implements OnInit, OnDestroy {
    tournaments: Tournament[] = [];
    upcomingTournaments: Tournament[] = [];
    pastTournaments: Tournament[] = [];
    currentUser: User | null = null;

    TournamentType = TournamentType;
    TournamentStatus = TournamentStatus;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private userService: UserService,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get tournaments from resolver
        this._activatedRoute.data
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ tournaments }) => {
                this.tournaments = tournaments || [];
                this._filterTournaments();
                this._changeDetectorRef.markForCheck();
            });

        // Get the current user
        this.userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                this.currentUser = user;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter tournaments into upcoming and past
     */
    private _filterTournaments(): void {
        const now = new Date();

        this.upcomingTournaments = this.tournaments
            .filter(
                (t) =>
                    t.status === TournamentStatus.PUBLISHED &&
                    new Date(t.endsAt) >= now
            )
            .sort(
                (a, b) =>
                    new Date(a.startsAt).getTime() -
                    new Date(b.startsAt).getTime()
            );

        this.pastTournaments = this.tournaments
            .filter((t) => new Date(t.endsAt) < now)
            .sort(
                (a, b) =>
                    new Date(b.startsAt).getTime() -
                    new Date(a.startsAt).getTime()
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * View tournament details
     */
    viewTournament(id: string): void {
        this._router.navigate([id], { relativeTo: this._activatedRoute });
    }

    /**
     * Get RSVP status badge class
     */
    getRsvpBadgeClass(tournament: Tournament): string {
        const myParticipant = tournament.participants?.find(
            (p) => p.userId === this.currentUser?.id
        );

        if (!myParticipant) return 'bg-gray-100 text-gray-800';

        switch (myParticipant.status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'DECLINED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Get my team info
     */
    getMyTeam(tournament: Tournament): any {
        const myParticipant = tournament.participants?.find(
            (p) => p.userId === this.currentUser?.id
        );

        if (!myParticipant) return null;

        const myTeam = tournament.teams?.find((team) =>
            team.members.some((m) => m.userId === myParticipant.userId)
        );

        if (!myTeam) return null;

        const teammate = myTeam.members.find(
            (m) => m.userId !== myParticipant.userId
        );

        return {
            team: myTeam,
            teammate: teammate?.user,
        };
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
