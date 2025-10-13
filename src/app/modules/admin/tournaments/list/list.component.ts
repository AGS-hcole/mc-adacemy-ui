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
    FormControl,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import {
    Tournament,
    TournamentFilters,
    TournamentStatus,
    TournamentType,
} from 'app/core/tournament/tournament.types';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'tournament-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LocalizedDatePipe,
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
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TournamentListComponent implements OnInit, OnDestroy {
    tournaments: Tournament[] = [];
    filteredTournaments: Tournament[] = [];

    searchControl = new FormControl('');
    statusControl = new FormControl<TournamentStatus | null>(null);
    typeControl = new FormControl<TournamentType | null>(null);

    TournamentStatus = TournamentStatus;
    TournamentType = TournamentType;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
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
        // Get tournaments from resolver
        this._activatedRoute.data
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ tournaments }) => {
                this.tournaments = tournaments || [];
                this.filteredTournaments = [...this.tournaments];
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to tournaments service
        this._tournamentsService.tournaments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournaments) => {
                if (tournaments) {
                    this.tournaments = tournaments;
                    this.applyFilters();
                }
            });

        // Subscribe to search input changes
        this.searchControl.valueChanges
            .pipe(debounceTime(300), takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.applyFilters();
            });

        // Subscribe to filter changes
        this.statusControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.applyFilters();
            });

        this.typeControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.applyFilters();
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
     * Apply filters to tournaments list
     */
    applyFilters(): void {
        const search = this.searchControl.value?.toLowerCase() || '';
        const status = this.statusControl.value;
        const type = this.typeControl.value;

        this.filteredTournaments = this.tournaments.filter((tournament) => {
            const matchesSearch =
                !search ||
                tournament.title.toLowerCase().includes(search) ||
                tournament.city.toLowerCase().includes(search);

            const matchesStatus = !status || tournament.status === status;
            const matchesType = !type || tournament.type === type;

            return matchesSearch && matchesStatus && matchesType;
        });

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create tournament
     */
    createTournament(): void {
        this._router.navigate(['new'], { relativeTo: this._activatedRoute });
    }

    /**
     * Edit tournament
     */
    editTournament(id: string): void {
        this._router.navigate([id], { relativeTo: this._activatedRoute });
    }

    /**
     * Delete tournament
     */
    deleteTournament(tournament: Tournament): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete tournament',
            message: `Are you sure you want to delete "${tournament.title}"?`,
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._tournamentsService
                    .remove(tournament.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => {
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Publish tournament
     */
    publishTournament(tournament: Tournament): void {
        this._tournamentsService
            .publish(tournament.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Archive tournament
     */
    archiveTournament(tournament: Tournament): void {
        this._tournamentsService
            .archive(tournament.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
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
