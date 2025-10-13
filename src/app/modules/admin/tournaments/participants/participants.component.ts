import { NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import {
    Tournament,
    UserLookupResult,
} from 'app/core/tournament/tournament.types';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'tournament-participants',
    templateUrl: './participants.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block w-full h-full' },
    imports: [
        NgFor,
        NgIf,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TranslocoModule,
    ],
})
export class TournamentParticipantsComponent implements OnInit, OnDestroy {
    tournament: Tournament | null = null;
    availableUsers: UserLookupResult[] = [];
    selectedParticipantIds: string[] = [];
    userSearchTerm = '';

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _tournamentsService: TournamentsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to tournament updates
        this._tournamentsService.tournament$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournament) => {
                if (tournament) {
                    this.tournament = tournament;
                    this.selectedParticipantIds = tournament.participants?.map(p => p.userId) || [];
                }
                this._changeDetectorRef.markForCheck();
            });

        // Load available users
        this._loadUsers();
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
     * Load available users
     */
    private _loadUsers(): void {
        this._tournamentsService
            .lookupUsers('')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((users) => {
                this.availableUsers = users;
                this._changeDetectorRef.markForCheck();
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get filtered users for participant selection
     */
    get filteredUsers(): UserLookupResult[] {
        if (!this.userSearchTerm) {
            return this.availableUsers;
        }
        const term = this.userSearchTerm.toLowerCase();
        return this.availableUsers.filter(
            (user) =>
                user.firstname.toLowerCase().includes(term) ||
                user.lastname.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
        );
    }

    /**
     * Get selected participants
     */
    get selectedParticipants(): UserLookupResult[] {
        return this.availableUsers.filter((user) =>
            this.selectedParticipantIds.includes(user.id)
        );
    }

    /**
     * Toggle participant selection
     */
    toggleParticipant(userId: string): void {
        const index = this.selectedParticipantIds.indexOf(userId);
        if (index >= 0) {
            this.selectedParticipantIds.splice(index, 1);
        } else {
            this.selectedParticipantIds.push(userId);
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save participants
     */
    saveParticipants(): void {
        if (!this.tournament) return;

        this._tournamentsService
            .replaceParticipants(this.tournament.id, this.selectedParticipantIds)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournament) => {
                this.tournament = tournament;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
