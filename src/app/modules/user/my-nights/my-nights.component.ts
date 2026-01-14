import { NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ResidenceApi } from 'app/core/api/residence.api';
import { ManorDto, ResidenceStayDto } from 'app/core/models/residence.models';
import {
    isAfterCutoffForDate,
    startOfWeekRange,
    toYmd,
} from 'app/core/utils/residence-date.utils';
import { DateTime } from 'luxon';
import { Subject, forkJoin, takeUntil } from 'rxjs';

interface DayInfo {
    date: DateTime;
    ymd: string;
    displayLabel: string;
    stay: ResidenceStayDto | null;
    isLocked: boolean;
}

@Component({
    selector: 'user-my-nights',
    templateUrl: './my-nights.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatButtonModule,
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        TranslocoModule,
    ],
})
export class MyNightsPageComponent implements OnInit, OnDestroy {
    days: DayInfo[] = [];
    manors: ManorDto[] = [];
    loading = false;

    selectedManorByDate: Map<string, string> = new Map();

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _residenceApi: ResidenceApi,
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        private _translocoService: TranslocoService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    loadData(): void {
        this.loading = true;

        const today = startOfWeekRange();
        const fromDate = toYmd(today);
        const toDate = today.plus({ days: 13 }); // 14 days total
        const toDateStr = toYmd(toDate);

        forkJoin({
            manors: this._residenceApi.listManors(true),
            stays: this._residenceApi.getMyStays(fromDate, toDateStr),
        })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: ({ manors, stays }) => {
                    this.manors = manors;

                    // If there's only one manor, pre-select it for all days
                    const defaultManorId =
                        manors.length === 1 ? manors[0].id : null;

                    // Build days array
                    this.days = [];
                    for (let i = 0; i < 14; i++) {
                        const date = today.plus({ days: i });
                        const ymd = toYmd(date);
                        const stay =
                            stays.find(
                                (s) => s.date === ymd && s.status === 'PLANNED'
                            ) || null;
                        const isLocked = isAfterCutoffForDate(ymd);

                        this.days.push({
                            date,
                            ymd,
                            displayLabel: this.formatDateLabel(date),
                            stay,
                            isLocked,
                        });

                        // Auto-select the manor if there's only one and no existing stay
                        if (defaultManorId && !stay) {
                            this.selectedManorByDate.set(ymd, defaultManorId);
                        }
                    }

                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    formatDateLabel(date: DateTime): string {
        // e.g., "Mer 14 jan"
        return date.setLocale('fr').toFormat('EEE d MMM');
    }

    subscribe(day: DayInfo): void {
        const manorId = this.selectedManorByDate.get(day.ymd);
        if (!manorId) {
            return;
        }

        this._residenceApi
            .createStay({ manorId, date: day.ymd })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this._snackBar.open(
                        this._translocoService.translate(
                            'USERS.MY_NIGHTS.SAVED'
                        ),
                        '',
                        { duration: 3000 }
                    );
                    this.loadData();
                },
                error: (err) => {
                    if (err.status === 403) {
                        this._snackBar.open(
                            this._translocoService.translate(
                                'USERS.MY_NIGHTS.CUTOFF_ERROR'
                            ),
                            '',
                            { duration: 5000 }
                        );
                    } else if (err.status === 409) {
                        this._snackBar.open(
                            this._translocoService.translate(
                                'USERS.MY_NIGHTS.FULL'
                            ),
                            '',
                            { duration: 5000 }
                        );
                    } else {
                        this._snackBar.open(
                            this._translocoService.translate(
                                'USERS.MY_NIGHTS.ERROR'
                            ),
                            '',
                            { duration: 3000 }
                        );
                    }
                },
            });
    }

    unsubscribe(day: DayInfo): void {
        if (!day.stay) {
            return;
        }

        this._residenceApi
            .cancelStay({ manorId: day.stay.manor.id, date: day.ymd })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this._snackBar.open(
                        this._translocoService.translate(
                            'USERS.MY_NIGHTS.SAVED'
                        ),
                        '',
                        { duration: 3000 }
                    );
                    this.loadData();
                },
                error: (err) => {
                    if (err.status === 403) {
                        this._snackBar.open(
                            this._translocoService.translate(
                                'USERS.MY_NIGHTS.CUTOFF_ERROR'
                            ),
                            '',
                            { duration: 5000 }
                        );
                    } else {
                        this._snackBar.open(
                            this._translocoService.translate(
                                'USERS.MY_NIGHTS.ERROR'
                            ),
                            '',
                            { duration: 3000 }
                        );
                    }
                },
            });
    }

    trackByYmd(index: number, day: DayInfo): string {
        return day.ymd;
    }
}
