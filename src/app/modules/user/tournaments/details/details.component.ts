import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
    RsvpStatus,
    Tournament,
    TournamentStatus,
    TournamentType,
} from 'app/core/tournament/tournament.types';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user-tournament-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LocalizedDatePipe,
        NgClass,
        NgFor,
        NgIf,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TranslocoModule,
    ],
})
export class UserTournamentDetailsComponent implements OnInit, OnDestroy {
    tournament: Tournament | null = null;
    feedbackControl = new FormControl('');

    TournamentType = TournamentType;
    TournamentStatus = TournamentStatus;
    RsvpStatus = RsvpStatus;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _tournamentsService: TournamentsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get tournament from resolver
        this._activatedRoute.data
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ tournament }) => {
                this.tournament = tournament;
                this._loadFeedback();
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to tournament updates
        this._tournamentsService.tournament$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournament) => {
                if (tournament) {
                    this.tournament = tournament;
                    this._loadFeedback();
                    this._changeDetectorRef.markForCheck();
                }
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
     * Load feedback if available
     */
    private _loadFeedback(): void {
        const myParticipant = this.tournament?.participants?.find(
            (p) => p.userId === 'current-user-id' // TODO: Get from auth service
        );
        if (myParticipant?.feedback) {
            this.feedbackControl.setValue(myParticipant.feedback);
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if tournament is in the past
     */
    get isPast(): boolean {
        if (!this.tournament) return false;
        return new Date(this.tournament.endsAt) < new Date();
    }

    /**
     * Check if can RSVP
     */
    get canRsvp(): boolean {
        if (!this.tournament) return false;
        return (
            this.tournament.status === TournamentStatus.PUBLISHED &&
            !this.isPast
        );
    }

    /**
     * Get my participant info
     */
    get myParticipant(): any {
        return this.tournament?.participants?.find(
            (p) => p.userId === 'current-user-id' // TODO: Get from auth service
        );
    }

    /**
     * Get my team
     */
    get myTeam(): any {
        const myParticipant = this.myParticipant;
        if (!myParticipant) return null;

        const team = this.tournament?.teams?.find((t) =>
            t.members.some((m) => m.userId === myParticipant.userId)
        );

        return team;
    }

    /**
     * Get my teammate
     */
    get myTeammate(): any {
        const myParticipant = this.myParticipant;
        const myTeam = this.myTeam;

        if (!myTeam) return null;

        const teammate = myTeam.members.find(
            (m) => m.userId !== myParticipant.userId
        );

        return teammate?.user;
    }

    /**
     * Confirm RSVP
     */
    confirmRsvp(): void {
        if (!this.tournament) return;

        this._tournamentsService
            .rsvp(this.tournament.id, RsvpStatus.CONFIRMED)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Decline RSVP
     */
    declineRsvp(): void {
        if (!this.tournament) return;

        this._tournamentsService
            .rsvp(this.tournament.id, RsvpStatus.DECLINED)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Submit feedback
     */
    submitFeedback(): void {
        if (!this.tournament || !this.feedbackControl.value) return;

        this._tournamentsService
            .feedback(this.tournament.id, this.feedbackControl.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Go back
     */
    goBack(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
