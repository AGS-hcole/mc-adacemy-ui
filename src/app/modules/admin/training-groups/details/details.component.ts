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
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Site } from 'app/core/session/session.types';
import {
    CreateTrainingGroupRequest,
    CreateTrainingGroupScheduleRequest,
    TrainingGroup,
    TrainingGroupSchedule,
    UpdateTrainingGroupRequest,
} from 'app/core/training-group/training-group.types';
import { TrainingGroupsService } from 'app/core/training-group/training-groups.service';
import { FormulaType, Role, User } from 'app/core/user/user.types';
import { UsersService } from 'app/modules/admin/users/users.service';
import {
    Observable,
    Subject,
    concatMap,
    finalize,
    forkJoin,
    of,
    takeUntil,
} from 'rxjs';

interface ScheduleFormValue {
    id?: string | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

@Component({
    selector: 'admin-training-group-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TranslocoModule,
    ],
})
export class AdminTrainingGroupDetailsComponent implements OnInit, OnDestroy {
    trainingGroupForm!: FormGroup;
    bulkScheduleForm!: FormGroup;
    trainingGroup: TrainingGroup | null = null;
    sites: Site[] = [];
    availableUsers: User[] = [];
    selectedBulkDays: number[] = [];
    userSearchTerm = '';
    isEditMode = false;
    saving = false;
    loadingUsers = false;

    readonly formulaLabels: Record<FormulaType, string> = {
        [FormulaType.MORNING]: 'Matin',
        [FormulaType.AFTERNOON]: 'Après-midi',
        [FormulaType.FULL]: 'Journée complète',
    };
    readonly dayOptions = [
        { value: 1, label: 'Lundi', shortLabel: 'Lun' },
        { value: 2, label: 'Mardi', shortLabel: 'Mar' },
        { value: 3, label: 'Mercredi', shortLabel: 'Mer' },
        { value: 4, label: 'Jeudi', shortLabel: 'Jeu' },
        { value: 5, label: 'Vendredi', shortLabel: 'Ven' },
        { value: 6, label: 'Samedi', shortLabel: 'Sam' },
        { value: 7, label: 'Dimanche', shortLabel: 'Dim' },
    ];

    private readonly _timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar,
        private _trainingGroupsService: TrainingGroupsService,
        private _translocoService: TranslocoService,
        private _usersService: UsersService
    ) {}

    ngOnInit(): void {
        this.trainingGroup =
            (this._activatedRoute.snapshot.data[
                'trainingGroup'
            ] as TrainingGroup | null) || null;
        this.sites =
            (this._activatedRoute.snapshot.data['sites'] as Site[]) || [];
        this.isEditMode = !!this.trainingGroup;

        this._initForms();
        this._patchTrainingGroup();
        this._loadUsers();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    get schedulesFormArray(): FormArray {
        return this.trainingGroupForm.get('schedules') as FormArray;
    }

    get selectedMemberIds(): string[] {
        return (this.trainingGroupForm.get('memberUserIds')?.value ||
            []) as string[];
    }

    get filteredUsers(): User[] {
        const term = this.userSearchTerm.trim().toLowerCase();
        const selectedIds = new Set(this.selectedMemberIds);

        return this.availableUsers
            .filter((user) => !selectedIds.has(user.id))
            .filter((user) => {
                if (!term) {
                    return true;
                }

                const fullName =
                    `${user.firstname} ${user.lastname}`.toLowerCase();
                return (
                    fullName.includes(term) ||
                    user.email.toLowerCase().includes(term)
                );
            });
    }

    get selectedUsers(): User[] {
        const selectedIds = new Set(this.selectedMemberIds);
        return this.availableUsers.filter((user) => selectedIds.has(user.id));
    }

    save(): void {
        if (this.trainingGroupForm.invalid) {
            this.trainingGroupForm.markAllAsTouched();
            this.bulkScheduleForm.markAllAsTouched();
            this._changeDetectorRef.markForCheck();
            return;
        }

        this.schedulesFormArray.markAllAsTouched();

        const request$ =
            this.isEditMode && this.trainingGroup
                ? this._saveExistingTrainingGroup()
                : this._createTrainingGroup();

        this.saving = true;
        this._changeDetectorRef.markForCheck();

        request$
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this._changeDetectorRef.markForCheck();
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: () => {
                    this._snackBar.open(
                        this._translocoService.translate(
                            this.isEditMode
                                ? 'TRAINING_GROUPS.ADMIN.UPDATE_SUCCESS'
                                : 'TRAINING_GROUPS.ADMIN.CREATE_SUCCESS'
                        ),
                        'OK',
                        { duration: 3000 }
                    );
                    this._router.navigate(['/admin/groups']);
                },
                error: (error) => {
                    console.error('Error saving training group:', error);
                    this._snackBar.open(
                        this._translocoService.translate(
                            'TRAINING_GROUPS.ADMIN.SAVE_ERROR'
                        ),
                        'OK',
                        { duration: 3000 }
                    );
                },
            });
    }

    cancel(): void {
        this._router.navigate(['/admin/groups']);
    }

    confirmDelete(): void {
        if (!this.trainingGroup) {
            return;
        }

        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'DIALOGS.DELETE_TRAINING_GROUP.TITLE'
            ),
            message: this._translocoService.translate(
                'DIALOGS.DELETE_TRAINING_GROUP.MESSAGE',
                { name: this.trainingGroup.name }
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

            this.saving = true;
            this._changeDetectorRef.markForCheck();

            this._trainingGroupsService
                .delete(this.trainingGroup!.id)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                        this._changeDetectorRef.markForCheck();
                    }),
                    takeUntil(this._unsubscribeAll)
                )
                .subscribe({
                    next: () => {
                        this._snackBar.open(
                            this._translocoService.translate(
                                'TRAINING_GROUPS.ADMIN.DELETE_SUCCESS'
                            ),
                            'OK',
                            { duration: 3000 }
                        );
                        this._router.navigate(['/admin/groups']);
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

    addUser(userId: string): void {
        if (!userId || this.selectedMemberIds.includes(userId)) {
            return;
        }

        this.trainingGroupForm.patchValue({
            memberUserIds: [...this.selectedMemberIds, userId],
        });
        this.userSearchTerm = '';
        this._changeDetectorRef.markForCheck();
    }

    removeUser(userId: string): void {
        this.trainingGroupForm.patchValue({
            memberUserIds: this.selectedMemberIds.filter((id) => id !== userId),
        });
        this._changeDetectorRef.markForCheck();
    }

    toggleBulkDay(dayOfWeek: number): void {
        if (this.selectedBulkDays.includes(dayOfWeek)) {
            this.selectedBulkDays = this.selectedBulkDays.filter(
                (day) => day !== dayOfWeek
            );
        } else {
            this.selectedBulkDays = [...this.selectedBulkDays, dayOfWeek].sort(
                (first, second) => first - second
            );
        }

        this._changeDetectorRef.markForCheck();
    }

    addBulkSchedules(): void {
        this.bulkScheduleForm.markAllAsTouched();

        if (
            this.bulkScheduleForm.invalid ||
            this.selectedBulkDays.length === 0
        ) {
            if (this.selectedBulkDays.length === 0) {
                this.bulkScheduleForm.get('daysPlaceholder')?.setErrors({
                    required: true,
                });
            }
            this._changeDetectorRef.markForCheck();
            return;
        }

        const { startTime, endTime } = this.bulkScheduleForm.getRawValue();
        const existingKeys = new Set(
            this.getScheduleValues().map(
                (schedule) =>
                    `${schedule.dayOfWeek}-${schedule.startTime}-${schedule.endTime}`
            )
        );

        let createdCount = 0;
        for (const dayOfWeek of this.selectedBulkDays) {
            const key = `${dayOfWeek}-${startTime}-${endTime}`;
            if (existingKeys.has(key)) {
                continue;
            }

            this.schedulesFormArray.push(
                this._createScheduleFormGroup({ dayOfWeek, startTime, endTime })
            );
            existingKeys.add(key);
            createdCount++;
        }

        this._sortSchedules();
        this.schedulesFormArray.updateValueAndValidity();
        this.selectedBulkDays = [];
        this.bulkScheduleForm.patchValue({
            daysPlaceholder: '',
        });
        this.bulkScheduleForm.get('daysPlaceholder')?.setErrors(null);

        if (createdCount === 0) {
            this._snackBar.open(
                this._translocoService.translate(
                    'TRAINING_GROUPS.ADMIN.SCHEDULE_DUPLICATE_ERROR'
                ),
                'OK',
                { duration: 3000 }
            );
        }

        this._changeDetectorRef.markForCheck();
    }

    addEmptySchedule(): void {
        this.schedulesFormArray.push(this._createScheduleFormGroup());
        this._changeDetectorRef.markForCheck();
    }

    removeSchedule(index: number): void {
        this.schedulesFormArray.removeAt(index);
        this.schedulesFormArray.updateValueAndValidity();
        this._changeDetectorRef.markForCheck();
    }

    getScheduleDayLabel(dayOfWeek: number): string {
        return (
            this.dayOptions.find((day) => day.value === dayOfWeek)
                ?.shortLabel || `${dayOfWeek}`
        );
    }

    getUserFormulaLabel(user: User): string | null {
        if (!user.formula) {
            return null;
        }

        return this.formulaLabels[user.formula] || null;
    }

    trackByUser(index: number, user: User): string {
        return user.id;
    }

    trackByIndex(index: number): number {
        return index;
    }

    private _initForms(): void {
        this.trainingGroupForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            siteId: ['', [Validators.required]],
            isActive: [true],
            memberUserIds: [[]],
            schedules: this._formBuilder.array([], {
                validators: [
                    this._requiredSchedulesValidator(),
                    this._duplicateSchedulesValidator(),
                ],
            }),
        });

        this.bulkScheduleForm = this._formBuilder.group(
            {
                daysPlaceholder: [''],
                startTime: [
                    '09:00',
                    [
                        Validators.required,
                        Validators.pattern(this._timePattern),
                    ],
                ],
                endTime: [
                    '10:30',
                    [
                        Validators.required,
                        Validators.pattern(this._timePattern),
                    ],
                ],
            },
            {
                validators: [this._timeRangeValidator()],
            }
        );
    }

    private _patchTrainingGroup(): void {
        if (!this.trainingGroup) {
            this.addEmptySchedule();
            return;
        }

        this.trainingGroupForm.patchValue({
            name: this.trainingGroup.name,
            siteId: this.trainingGroup.siteId,
            isActive: this.trainingGroup.isActive,
            memberUserIds: (this.trainingGroup.members || []).map(
                (member) => member.userId
            ),
        });

        this.schedulesFormArray.clear();
        this._sortScheduleValues(this.trainingGroup.schedules || []).forEach(
            (schedule) => {
                this.schedulesFormArray.push(
                    this._createScheduleFormGroup(schedule)
                );
            }
        );

        if (this.schedulesFormArray.length === 0) {
            this.addEmptySchedule();
        }
    }

    private _loadUsers(): void {
        this.loadingUsers = true;
        this._usersService
            .getUsers()
            .pipe(
                finalize(() => {
                    this.loadingUsers = false;
                    this._changeDetectorRef.markForCheck();
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (users) => {
                    this.availableUsers = [...users]
                        .filter((user) => user.role === Role.user)
                        .sort((first, second) => {
                            const firstName = `${first.firstname} ${first.lastname}`;
                            const secondName = `${second.firstname} ${second.lastname}`;
                            return firstName.localeCompare(secondName, 'fr', {
                                sensitivity: 'base',
                            });
                        });
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                    this._snackBar.open(
                        this._translocoService.translate(
                            'TRAINING_GROUPS.ADMIN.USERS_LOAD_ERROR'
                        ),
                        'OK',
                        { duration: 3000 }
                    );
                },
            });
    }

    private _createTrainingGroup(): Observable<TrainingGroup> {
        const payload: CreateTrainingGroupRequest = {
            name: this.trainingGroupForm.get('name')?.value,
            siteId: this.trainingGroupForm.get('siteId')?.value,
            isActive: this.trainingGroupForm.get('isActive')?.value,
            memberUserIds: this.selectedMemberIds,
            schedules: this._getSortedSchedulePayload(),
        };

        return this._trainingGroupsService.create(payload);
    }

    private _saveExistingTrainingGroup(): Observable<unknown> {
        const trainingGroup = this.trainingGroup!;
        const finalSchedules = this.getScheduleValues();
        const metadataPayload: UpdateTrainingGroupRequest = {};
        const operations: Observable<unknown>[] = [];

        const name = this.trainingGroupForm.get('name')?.value;
        const siteId = this.trainingGroupForm.get('siteId')?.value;
        const isActive = this.trainingGroupForm.get('isActive')?.value;

        if (name !== trainingGroup.name) {
            metadataPayload.name = name;
        }
        if (siteId !== trainingGroup.siteId) {
            metadataPayload.siteId = siteId;
        }
        if (isActive !== trainingGroup.isActive) {
            metadataPayload.isActive = isActive;
        }

        const initialMemberIds = new Set(
            (trainingGroup.members || []).map((member) => member.userId)
        );
        const finalMemberIds = new Set(this.selectedMemberIds);

        const membersToAdd = this.selectedMemberIds.filter(
            (userId) => !initialMemberIds.has(userId)
        );
        const membersToRemove = [...initialMemberIds].filter(
            (userId) => !finalMemberIds.has(userId)
        );

        if (membersToAdd.length > 0) {
            operations.push(
                this._trainingGroupsService.addMembers(trainingGroup.id, {
                    userIds: membersToAdd,
                })
            );
        }

        if (membersToRemove.length > 0) {
            operations.push(
                this._trainingGroupsService.removeMembers(trainingGroup.id, {
                    userIds: membersToRemove,
                })
            );
        }

        const initialSchedules = new Map(
            (trainingGroup.schedules || []).map((schedule) => [
                schedule.id,
                schedule,
            ])
        );
        const keptScheduleIds = new Set(
            finalSchedules
                .map((schedule) => schedule.id)
                .filter((scheduleId): scheduleId is string => !!scheduleId)
        );

        finalSchedules.forEach((schedule) => {
            if (!schedule.id) {
                operations.push(
                    this._trainingGroupsService.createSchedule(
                        trainingGroup.id,
                        {
                            dayOfWeek: schedule.dayOfWeek,
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                        }
                    )
                );
                return;
            }

            const initialSchedule = initialSchedules.get(schedule.id);
            if (!initialSchedule) {
                return;
            }

            if (
                initialSchedule.dayOfWeek !== schedule.dayOfWeek ||
                initialSchedule.startTime !== schedule.startTime ||
                initialSchedule.endTime !== schedule.endTime
            ) {
                operations.push(
                    this._trainingGroupsService.updateSchedule(
                        trainingGroup.id,
                        schedule.id,
                        {
                            dayOfWeek: schedule.dayOfWeek,
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                        }
                    )
                );
            }
        });

        [...initialSchedules.keys()]
            .filter((scheduleId) => !keptScheduleIds.has(scheduleId))
            .forEach((scheduleId) => {
                operations.push(
                    this._trainingGroupsService.deleteSchedule(
                        trainingGroup.id,
                        scheduleId
                    )
                );
            });

        const metadataRequest$ = Object.keys(metadataPayload).length
            ? this._trainingGroupsService.update(
                  trainingGroup.id,
                  metadataPayload
              )
            : of(trainingGroup);

        return metadataRequest$.pipe(
            concatMap(() => {
                if (operations.length === 0) {
                    return of([]);
                }

                return forkJoin(operations);
            })
        );
    }

    private _createScheduleFormGroup(
        schedule?: Partial<TrainingGroupSchedule> | ScheduleFormValue
    ): FormGroup {
        return this._formBuilder.group(
            {
                id: [schedule?.id || null],
                dayOfWeek: [schedule?.dayOfWeek ?? 1, [Validators.required]],
                startTime: [
                    schedule?.startTime || '09:00',
                    [
                        Validators.required,
                        Validators.pattern(this._timePattern),
                    ],
                ],
                endTime: [
                    schedule?.endTime || '10:30',
                    [
                        Validators.required,
                        Validators.pattern(this._timePattern),
                    ],
                ],
            },
            {
                validators: [this._timeRangeValidator()],
            }
        );
    }

    private _timeRangeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const startTime = control.get('startTime')?.value;
            const endTime = control.get('endTime')?.value;

            if (!startTime || !endTime) {
                return null;
            }

            if (
                !this._timePattern.test(startTime) ||
                !this._timePattern.test(endTime)
            ) {
                return null;
            }

            return this._toMinutes(endTime) > this._toMinutes(startTime)
                ? null
                : { invalidRange: true };
        };
    }

    private _duplicateSchedulesValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const formArray = control as FormArray;
            const seenKeys = new Set<string>();

            for (const scheduleControl of formArray.controls) {
                const dayOfWeek = scheduleControl.get('dayOfWeek')?.value;
                const startTime = scheduleControl.get('startTime')?.value;
                const endTime = scheduleControl.get('endTime')?.value;

                if (!dayOfWeek || !startTime || !endTime) {
                    continue;
                }

                const key = `${dayOfWeek}-${startTime}-${endTime}`;
                if (seenKeys.has(key)) {
                    return { duplicateSchedules: true };
                }

                seenKeys.add(key);
            }

            return null;
        };
    }

    private _requiredSchedulesValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const formArray = control as FormArray;
            return formArray.length > 0 ? null : { required: true };
        };
    }

    private _toMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private _sortSchedules(): void {
        const sortedSchedules = this._sortScheduleValues(
            this.getScheduleValues()
        );
        this.schedulesFormArray.clear();
        sortedSchedules.forEach((schedule) => {
            this.schedulesFormArray.push(
                this._createScheduleFormGroup(schedule)
            );
        });
    }

    private _sortScheduleValues<T extends Partial<TrainingGroupSchedule>>(
        schedules: T[]
    ): T[] {
        return [...schedules].sort((first, second) => {
            if ((first.dayOfWeek || 0) !== (second.dayOfWeek || 0)) {
                return (first.dayOfWeek || 0) - (second.dayOfWeek || 0);
            }

            return (first.startTime || '').localeCompare(
                second.startTime || ''
            );
        });
    }

    private getScheduleValues(): ScheduleFormValue[] {
        return this.schedulesFormArray.getRawValue() as ScheduleFormValue[];
    }

    private _getSortedSchedulePayload(): CreateTrainingGroupScheduleRequest[] {
        return this._sortScheduleValues(this.getScheduleValues()).map(
            (schedule) => ({
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            })
        );
    }
}
