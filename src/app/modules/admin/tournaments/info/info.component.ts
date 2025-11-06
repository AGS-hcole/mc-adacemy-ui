import { NgClass, NgIf } from '@angular/common';
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
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import {
    CreateTournamentRequest,
    Tournament,
    TournamentStatus,
    TournamentType,
    UpdateTournamentRequest,
} from 'app/core/tournament/tournament.types';
import { TournamentsService } from 'app/core/tournament/tournaments.service';
import { Subject, takeUntil } from 'rxjs';
import { TournamentViewComponent } from '../view/view.component';

@Component({
    selector: 'tournament-info',
    templateUrl: './info.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block w-full h-full' },
    imports: [
        NgClass,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        RouterLink,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        TranslocoModule,
    ],
})
export class TournamentInfoComponent implements OnInit, OnDestroy {
    tournament: Tournament | null = null;
    tournamentForm: FormGroup;
    isNew = false;

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
        private _translocoService: TranslocoService,
        private _tournamentViewComponent: TournamentViewComponent
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
                    this.isNew = false;
                } else {
                    this.isNew = true;
                }
                this._initForm();
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
            city: [this.tournament?.city || '', [Validators.required]],
            country: [this.tournament?.country || '', [Validators.required]],
            latitude: [this.tournament?.latitude || null],
            longitude: [this.tournament?.longitude || null],
            startsAt: [
                this.tournament?.startsAt || null,
                [Validators.required],
            ],
            endsAt: [this.tournament?.endsAt || null, [Validators.required]],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
                    this._router.navigate(['../../', tournament.id, 'info'], {
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
        if (
            !this.tournament.participants ||
            this.tournament.participants.length < 2
        ) {
            alert(
                this._translocoService.translate(
                    'TOURNAMENTS.ADMIN.PUBLISH_ERROR_PARTICIPANTS'
                )
            );
            return;
        }

        if (!this.tournament.teams || this.tournament.teams.length === 0) {
            alert(
                this._translocoService.translate(
                    'TOURNAMENTS.ADMIN.PUBLISH_ERROR_TEAMS'
                )
            );
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
        this._router.navigate(['../../'], { relativeTo: this._activatedRoute });
    }

    /**
     * Toggle the parent drawer
     */
    toggleParentDrawer(): Promise<MatDrawerToggleResult> {
        return this._tournamentViewComponent.drawer.toggle();
    }
}
