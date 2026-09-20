import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Site } from 'app/core/session/session.types';
import {
    TrainingGroup,
    TrainingGroupMember,
    TrainingGroupSchedule,
} from 'app/core/training-group/training-group.types';
import { TrainingGroupsService } from 'app/core/training-group/training-groups.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-training-groups-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class AdminTrainingGroupsListComponent implements OnInit, OnDestroy {
    trainingGroups: TrainingGroup[] = [];
    sites: Site[] = [];
    loading = true;
    searchInputControl: UntypedFormControl = new UntypedFormControl('');

    private readonly _dayLabels: Record<number, string> = {
        1: 'Lun',
        2: 'Mar',
        3: 'Mer',
        4: 'Jeu',
        5: 'Ven',
        6: 'Sam',
        7: 'Dim',
    };
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _trainingGroupsService: TrainingGroupsService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar,
        private _translocoService: TranslocoService
    ) {}

    ngOnInit(): void {
        this.trainingGroups =
            (this._activatedRoute.snapshot.data[
                'trainingGroups'
            ] as TrainingGroup[]) || [];
        this.sites =
            (this._activatedRoute.snapshot.data['sites'] as Site[]) || [];
        this.loading = false;

        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(200))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });

        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    get filteredTrainingGroups(): TrainingGroup[] {
        const search = (this.searchInputControl.value || '')
            .trim()
            .toLowerCase();
        const groups = [...this.trainingGroups].sort((first, second) =>
            first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' })
        );

        if (!search) {
            return groups;
        }

        return groups.filter((trainingGroup) => {
            const siteName = this.getSiteName(trainingGroup).toLowerCase();
            const memberMatches = (trainingGroup.members || []).some((member) =>
                this.getMemberLabel(member).toLowerCase().includes(search)
            );

            return (
                trainingGroup.name.toLowerCase().includes(search) ||
                siteName.includes(search) ||
                memberMatches
            );
        });
    }

    createTrainingGroup(): void {
        this._router.navigate(['new'], { relativeTo: this._activatedRoute });
    }

    editTrainingGroup(trainingGroupId: string): void {
        this._router.navigate([trainingGroupId], {
            relativeTo: this._activatedRoute,
        });
    }

    deleteTrainingGroup(trainingGroup: TrainingGroup): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.DELETE_TRAINING_GROUP.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.DELETE_TRAINING_GROUP.MESSAGE',
                { name: trainingGroup.name }
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate(
                        'DIALOGS.DELETE_TRAINING_GROUP.CONFIRM'
                    ),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result !== 'confirmed') {
                return;
            }

            this._trainingGroupsService.delete(trainingGroup.id).subscribe({
                next: () => {
                    this.trainingGroups = this.trainingGroups.filter(
                        (item) => item.id !== trainingGroup.id
                    );
                    this._snackBar.open(
                        this._translocoService.translate(
                            'TRAINING_GROUPS.ADMIN.DELETE_SUCCESS'
                        ),
                        'OK',
                        { duration: 3000 }
                    );
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error deleting training group:', error);
                    this._snackBar.open(
                        this._translocoService.translate(
                            'TRAINING_GROUPS.ADMIN.DELETE_ERROR'
                        ),
                        'OK',
                        { duration: 3000 }
                    );
                },
            });
        });
    }

    getSiteName(trainingGroup: TrainingGroup): string {
        if (trainingGroup.site?.name) {
            return trainingGroup.site.name;
        }

        return (
            this.sites.find((site) => site.id === trainingGroup.siteId)?.name ||
            trainingGroup.siteId
        );
    }

    getSortedSchedules(trainingGroup: TrainingGroup): TrainingGroupSchedule[] {
        return [...(trainingGroup.schedules || [])].sort((first, second) => {
            if (first.dayOfWeek !== second.dayOfWeek) {
                return first.dayOfWeek - second.dayOfWeek;
            }

            return first.startTime.localeCompare(second.startTime);
        });
    }

    getDayLabel(dayOfWeek: number): string {
        return this._dayLabels[dayOfWeek] || `${dayOfWeek}`;
    }

    getMembersCountLabel(trainingGroup: TrainingGroup): string {
        const count = trainingGroup.members?.length || 0;
        return this._translocoService.translate(
            count > 1
                ? 'TRAINING_GROUPS.ADMIN.COUNTS.PLAYERS'
                : 'TRAINING_GROUPS.ADMIN.COUNTS.PLAYER',
            { count }
        );
    }

    getSchedulesCountLabel(trainingGroup: TrainingGroup): string {
        const count = trainingGroup.schedules?.length || 0;
        return this._translocoService.translate(
            count > 1
                ? 'TRAINING_GROUPS.ADMIN.COUNTS.SCHEDULES'
                : 'TRAINING_GROUPS.ADMIN.COUNTS.SCHEDULE',
            { count }
        );
    }

    getMemberLabel(member: TrainingGroupMember): string {
        if (!member.user) {
            return member.userId;
        }

        return `${member.user.firstname} ${member.user.lastname}`.trim();
    }

    trackByFn(index: number, item: TrainingGroup): string {
        return item.id;
    }
}
