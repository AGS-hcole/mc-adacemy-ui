import { NgClass, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { SelectionModel } from '@angular/cdk/collections';
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
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TournamentListComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;

    dsTournaments: MatTableDataSource<Tournament> = new MatTableDataSource<Tournament>();
    selection = new SelectionModel<Tournament>(true, []);

    searchControl = new FormControl('');
    statusControl = new FormControl<TournamentStatus | null>(null);
    typeControl = new FormControl<TournamentType | null>(null);

    TournamentStatus = TournamentStatus;
    TournamentType = TournamentType;

    columnsToDisplay: string[] = [
        'checkboxSelected',
        'title',
        'type',
        'dates',
        'location',
        'status',
        'actions',
    ];

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
        // Setup filter predicate
        this.dsTournaments.filterPredicate = (data: Tournament, filter: string) => {
            const filterObj = JSON.parse(filter);
            const search = filterObj.search?.toLowerCase() || '';
            const status = filterObj.status;
            const type = filterObj.type;

            const matchesSearch =
                !search ||
                data.title.toLowerCase().includes(search) ||
                data.city.toLowerCase().includes(search);

            const matchesStatus = !status || data.status === status;
            const matchesType = !type || data.type === type;

            return matchesSearch && matchesStatus && matchesType;
        };

        // Get tournaments from resolver
        this._activatedRoute.data
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ tournaments }) => {
                this.dsTournaments.data = tournaments || [];
                if (this.sort) {
                    this.dsTournaments.sort = this.sort;
                }
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to tournaments service
        this._tournamentsService.tournaments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tournaments) => {
                if (tournaments) {
                    this.dsTournaments.data = tournaments;
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
        const search = this.searchControl.value || '';
        const status = this.statusControl.value;
        const type = this.typeControl.value;

        this.dsTournaments.filter = JSON.stringify({
            search,
            status,
            type,
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

    /**
     * Whether the number of selected elements matches the total number of rows
     */
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dsTournaments.data.length;
        return numSelected === numRows;
    }

    /**
     * Selects all rows if they are not all selected; otherwise clear selection
     */
    selectAll(): void {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.dsTournaments.data.forEach((row) => this.selection.select(row));
        }
    }

    /**
     * Check if there are active filters
     */
    hasActiveFilters(): boolean {
        return (
            (this.searchControl.value && this.searchControl.value.length > 0) ||
            this.statusControl.value !== null ||
            this.typeControl.value !== null
        );
    }

    /**
     * Clear all filters
     */
    clearFilters(): void {
        this.searchControl.setValue('');
        this.statusControl.setValue(null);
        this.typeControl.setValue(null);
    }
}
