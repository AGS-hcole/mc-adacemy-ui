import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import {
    CreateTournamentRequest,
    Team,
    Tournament,
    TournamentStatus,
    TournamentType,
    UpdateTournamentRequest,
    UserLookupResult,
} from 'app/core/tournament/tournament.types';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'tournament-edit',
    templateUrl: './edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        NgFor,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        MatChipsModule,
        MatTooltipModule,
        TranslocoModule,
        CdkDropList,
        CdkDrag,
    ],
})
export class TournamentEditComponent implements OnInit, OnDestroy {
    tournament: Tournament | null = null;
    tournamentForm: FormGroup;
    isNew = false;
    
    // Participants
    availableUsers: UserLookupResult[] = [];
    selectedParticipantIds: string[] = [];
    userSearchTerm = '';
    
    // Teams
    teams: Team[] = [];
    unassignedParticipants: any[] = [];

    TournamentType = TournamentType;
    TournamentStatus = TournamentStatus;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _tournamentsService: TournamentsService,
        private _fuseConfirmationService: FuseConfirmationService
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
                if (tournament) {
                    this.tournament = tournament;
                    this.isNew = false;
                    this.selectedParticipantIds = tournament.participants?.map(p => p.userId) || [];
                    this.teams = tournament.teams || [];
                } else {
                    this.isNew = true;
                }
                this._initForm();
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to tournament updates
        this._tournamentsService.tournament$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournament) => {
                if (tournament) {
                    this.tournament = tournament;
                    this.teams = tournament.teams || [];
                    this._changeDetectorRef.markForCheck();
                }
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
     * Initialize form
     */
    private _initForm(): void {
        this.tournamentForm = this._formBuilder.group({
            title: [this.tournament?.title || '', [Validators.required]],
            type: [
                this.tournament?.type || TournamentType.P1000,
                [Validators.required],
            ],
            addressLine1: [
                this.tournament?.addressLine1 || '',
                [Validators.required],
            ],
            addressLine2: [this.tournament?.addressLine2 || ''],
            postalCode: [
                this.tournament?.postalCode || '',
                [Validators.required],
            ],
            city: [
                this.tournament?.city || '',
                [Validators.required],
            ],
            country: [
                this.tournament?.country || '',
                [Validators.required],
            ],
            latitude: [this.tournament?.latitude || null],
            longitude: [this.tournament?.longitude || null],
            startsAt: [
                this.tournament?.startsAt || null,
                [Validators.required],
            ],
            endsAt: [this.tournament?.endsAt || null, [Validators.required]],
        });
    }

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
     * Save tournament
     */
    save(): void {
        if (this.tournamentForm.invalid) {
            return;
        }

        const formValue = this.tournamentForm.value;
        const startsAt = formValue.startsAt
            ? new Date(formValue.startsAt).toISOString()
            : null;
        const endsAt = formValue.endsAt
            ? new Date(formValue.endsAt).toISOString()
            : null;

        if (this.isNew) {
            const request: CreateTournamentRequest = {
                title: formValue.title,
                type: formValue.type,
                addressLine1: formValue.addressLine1,
                addressLine2: formValue.addressLine2,
                postalCode: formValue.postalCode,
                city: formValue.city,
                country: formValue.country,
                latitude: formValue.latitude,
                longitude: formValue.longitude,
                startsAt,
                endsAt,
            };

            this._tournamentsService
                .create(request)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((tournament) => {
                    this._router.navigate(['../', tournament.id], {
                        relativeTo: this._activatedRoute,
                    });
                });
        } else {
            const request: UpdateTournamentRequest = {
                title: formValue.title,
                type: formValue.type,
                addressLine1: formValue.addressLine1,
                addressLine2: formValue.addressLine2,
                postalCode: formValue.postalCode,
                city: formValue.city,
                country: formValue.country,
                latitude: formValue.latitude,
                longitude: formValue.longitude,
                startsAt,
                endsAt,
            };

            this._tournamentsService
                .update(this.tournament.id, request)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * Publish tournament
     */
    publish(): void {
        if (!this.tournament) return;

        // Validate before publish
        if (!this.tournament.participants || this.tournament.participants.length < 2) {
            alert('Cannot publish: need at least 2 participants');
            return;
        }

        if (!this.tournament.teams || this.tournament.teams.length === 0) {
            alert('Cannot publish: no teams generated');
            return;
        }

        this._tournamentsService
            .publish(this.tournament.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournament) => {
                this.tournament = tournament;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Cancel and navigate back
     */
    cancel(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
