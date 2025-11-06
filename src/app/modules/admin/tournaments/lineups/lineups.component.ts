import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import {
    BenchParticipantDto,
    CreateTeamDto,
    GenerateTeamsDto,
    TeamMemberDto,
    TeamWithMembersDto,
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
        NgClass,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDialogModule,
        TranslocoModule,
        CommonModule,
        CdkDropList,
        CdkDrag,
    ],
})
export class TournamentLineupsComponent implements OnInit, OnDestroy {
    tournament: Tournament | null = null;
    teams: TeamWithMembersDto[] = [];
    bench: BenchParticipantDto[] = [];
    teamSize = 2;
    loading = false;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _tournamentsService: TournamentsService,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _translocoService: TranslocoService
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
                    this._loadTeams();
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
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load teams with members and bench
     */
    private _loadTeams(): void {
        if (!this.tournament) return;

        this.loading = true;
        this._tournamentsService
            .getTeams(this.tournament.id, true)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams = response.teams.map((team) => ({
                        ...team,
                        teamStrength: this._calculateTeamStrength(team),
                        avgStrength: this._calculateAvgStrength(team),
                    }));
                    this.bench = response.bench;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Calculate team strength (sum of rankings)
     */
    private _calculateTeamStrength(team: TeamWithMembersDto): number {
        return team.members.reduce((sum, member) => {
            const rank = member.rankSnapshot ?? member.currentRanking ?? 0;
            return sum + rank;
        }, 0);
    }

    /**
     * Calculate average team strength
     */
    private _calculateAvgStrength(team: TeamWithMembersDto): number {
        if (team.members.length === 0) return 0;
        return this._calculateTeamStrength(team) / team.members.length;
    }

    /**
     * Get all team list IDs for drag & drop connectivity
     */
    private _getTeamListIds(): string[] {
        return this.teams.map((team) => `team-${team.id}`);
    }

    /**
     * Get all connected list IDs (teams + bench)
     */
    private _getConnectedListIds(): string[] {
        return ['bench', ...this._getTeamListIds()];
    }

    /**
     * Get connected list IDs excluding a specific team
     */
    private _getConnectedListIdsExcluding(teamId: string): string[] {
        return [
            'bench',
            ...this._getTeamListIds().filter((id) => id !== `team-${teamId}`),
        ];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generate teams with options
     */
    generateTeams(): void {
        if (!this.tournament) return;

        // TODO: Open dialog for options
        const options: GenerateTeamsDto = {
            method: 'BALANCED',
            preserveLocked: false,
            clearExisting: true,
            allowOddParticipant: true,
            snapshotRanking: true,
            teamSize: 2,
            randomSeed: 1,
        };

        this.loading = true;
        this._tournamentsService
            .generateTeamsWithOptions(this.tournament.id, options)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams = response.teams.map((team) => ({
                        ...team,
                        teamStrength: this._calculateTeamStrength(team),
                        avgStrength: this._calculateAvgStrength(team),
                    }));
                    this.bench = response.bench;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open(
                        this._translocoService.translate(
                            'TOURNAMENTS.FORMS.LINEUPS.GENERATE_ERROR'
                        ),
                        this._translocoService.translate('SHARED.CLOSE'),
                        {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top',
                        }
                    );
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Rebalance teams (preserves locked)
     */
    rebalanceTeams(): void {
        if (!this.tournament) return;

        const options: GenerateTeamsDto = {
            method: 'BALANCED',
            preserveLocked: true,
            clearExisting: true,
            allowOddParticipant: true,
            snapshotRanking: true,
            teamSize: 2,
        };

        this.loading = true;
        this._tournamentsService
            .rebalanceTeams(this.tournament.id, options)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams = response.teams.map((team) => ({
                        ...team,
                        teamStrength: this._calculateTeamStrength(team),
                        avgStrength: this._calculateAvgStrength(team),
                    }));
                    this.bench = response.bench;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open('Failed to rebalance teams', 'Close', {
                        duration: 3000,
                    });
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Create team
     */
    createTeam(): void {
        if (!this.tournament) return;

        const maxOrder = this.teams.length
            ? Math.max(...this.teams.map((t) => t.orderIndex ?? 0))
            : 0;

        const request: CreateTeamDto = {
            locked: false,
            orderIndex: maxOrder + 1,
        };

        this._tournamentsService
            .createTeam(this.tournament.id, request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams.push(response);
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._snackBar.open('Failed to create team', 'Close', {
                        duration: 3000,
                    });
                },
            });
    }

    /**
     * Delete team
     */
    deleteTeam(team: TeamWithMembersDto): void {
        if (!this.tournament) return;

        this._tournamentsService
            .deleteTeam(this.tournament.id, team.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.teams = this.teams.filter((t) => t.id !== team.id);
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open('Failed to delete team', 'Close', {
                        duration: 3000,
                    });
                },
            });
    }

    /**
     * Clear teams
     */
    clearTeams(): void {
        if (!this.tournament) return;

        // TODO: Add confirmation dialog

        this.loading = true;
        this._tournamentsService
            .clearTeams(this.tournament.id, true)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this._loadTeams();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open('Failed to clear teams', 'Close', {
                        duration: 3000,
                    });
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Toggle team lock
     */
    toggleTeamLock(team: TeamWithMembersDto): void {
        if (!this.tournament) return;

        const newLockStatus = !team.locked;
        this._tournamentsService
            .setTeamLock(this.tournament.id, team.id, newLockStatus)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    team.locked = newLockStatus;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._snackBar.open(
                        'Failed to update lock status',
                        'Close',
                        {
                            duration: 3000,
                        }
                    );
                },
            });
    }

    /**
     * Handle team card drop (reordering)
     */
    dropTeamCard(event: CdkDragDrop<TeamWithMembersDto[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                this.teams,
                event.previousIndex,
                event.currentIndex
            );

            // Update order on backend
            if (this.tournament) {
                const order = this.teams.map((team, index) => ({
                    teamId: team.id,
                    orderIndex: index + 1,
                }));
                this._tournamentsService
                    .reorderTeamsWithIndex(this.tournament.id, { order })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: (response) => {
                            this.teams = response.teams.map((team) => ({
                                ...team,
                                teamStrength: this._calculateTeamStrength(team),
                                avgStrength: this._calculateAvgStrength(team),
                            }));
                            this.bench = response.bench;
                            this._changeDetectorRef.markForCheck();
                        },
                        error: () => {
                            this._snackBar.open(
                                'Failed to reorder teams',
                                'Close',
                                {
                                    duration: 3000,
                                }
                            );
                        },
                    });
            }
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle member drop (move between teams/bench)
     */
    dropMember(
        event: CdkDragDrop<TeamMemberDto[] | BenchParticipantDto[]>
    ): void {
        // Same list - just reorder (minimal value for teamSize=2)
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            this._changeDetectorRef.markForCheck();
            return;
        }

        // Get source and target info
        const sourceId = event.previousContainer.id;
        const targetId = event.container.id;
        const participant = event.previousContainer.data[
            event.previousIndex
        ] as TeamMemberDto | BenchParticipantDto;

        // Determine target team
        const targetTeam =
            targetId === 'bench'
                ? null
                : this.teams.find((t) => `team-${t.id}` === targetId);

        // Check if target team is locked
        if (targetTeam && targetTeam.locked) {
            this._snackBar.open('Cannot move to locked team', 'Close', {
                duration: 3000,
            });
            return;
        }

        // Check if target team is full
        if (targetTeam && targetTeam.members.length >= this.teamSize) {
            this._snackBar.open(
                'Team is full. Swap not yet implemented.',
                'Close',
                {
                    duration: 3000,
                }
            );
            return;
        }

        // Get participant ID based on type
        let participantId: string;
        if ('memberId' in participant) {
            // TeamMemberDto - use participantId
            participantId = participant.participantId;
        } else {
            // BenchParticipantDto
            participantId = participant.participantId;
        }

        if (!this.tournament) return;

        this.loading = true;
        this._tournamentsService
            .moveParticipant(this.tournament.id, {
                participantId,
                targetTeamId: targetTeam?.id ?? null,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams = response.teams.map((team) => ({
                        ...team,
                        teamStrength: this._calculateTeamStrength(team),
                        avgStrength: this._calculateAvgStrength(team),
                    }));
                    this.bench = response.bench;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open('Failed to move participant', 'Close', {
                        duration: 3000,
                    });
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Move participant to specific team
     */
    moveToTeam(participantId: string, targetTeamId: string): void {
        if (!this.tournament) return;

        this.loading = true;
        this._tournamentsService
            .moveParticipant(this.tournament.id, {
                participantId,
                targetTeamId,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams = response.teams.map((team) => ({
                        ...team,
                        teamStrength: this._calculateTeamStrength(team),
                        avgStrength: this._calculateAvgStrength(team),
                    }));
                    this.bench = response.bench;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open('Failed to move participant', 'Close', {
                        duration: 3000,
                    });
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Move participant to bench
     */
    moveToBench(participantId: string): void {
        if (!this.tournament) return;

        this.loading = true;
        this._tournamentsService
            .moveParticipant(this.tournament.id, {
                participantId,
                targetTeamId: null,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teams = response.teams.map((team) => ({
                        ...team,
                        teamStrength: this._calculateTeamStrength(team),
                        avgStrength: this._calculateAvgStrength(team),
                    }));
                    this.bench = response.bench;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open('Failed to move to bench', 'Close', {
                        duration: 3000,
                    });
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    /**
     * Get available teams for moving (not full and not locked)
     */
    getAvailableTeamsForMove(currentTeamId?: string): TeamWithMembersDto[] {
        return this.teams.filter(
            (team) =>
                team.id !== currentTeamId &&
                !team.locked &&
                team.members.length < this.teamSize
        );
    }

    /**
     * Get connected list IDs for a team
     */
    getConnectedListIds(teamId: string): string[] {
        return this._getConnectedListIdsExcluding(teamId);
    }

    /**
     * Get all team list IDs
     */
    getTeamListIds(): string[] {
        return this._getTeamListIds();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
