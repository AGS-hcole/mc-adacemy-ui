import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgFor, NgIf } from '@angular/common';
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
import { TranslocoModule } from '@jsverse/transloco';
import {
    Team,
    Tournament,
} from 'app/core/tournament/tournament.types';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'tournament-lineups',
    templateUrl: './lineups.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block w-full h-full' },
    imports: [
        NgFor,
        NgIf,
        MatButtonModule,
        MatIconModule,
        TranslocoModule,
        CdkDropList,
        CdkDrag,
    ],
})
export class TournamentLineupsComponent implements OnInit, OnDestroy {
    tournament: Tournament | null = null;
    teams: Team[] = [];

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
                    this.teams = tournament.teams || [];
                }
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
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generate teams
     */
    generateTeams(): void {
        if (!this.tournament) return;

        this._tournamentsService
            .generateTeams(this.tournament.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournament) => {
                this.tournament = tournament;
                this.teams = tournament.teams || [];
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Handle team drop event
     */
    dropTeam(event: CdkDragDrop<Team[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(this.teams, event.previousIndex, event.currentIndex);
            
            // Reorder teams on backend
            if (this.tournament) {
                const teamOrder = this.teams.map(t => t.id);
                this._tournamentsService
                    .reorderTeams(this.tournament.id, teamOrder)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe();
            }
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
