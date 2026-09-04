import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';
import { ParentService } from 'app/core/parent/parent.service';
import { ParentChild, ParentDashboardDto } from 'app/core/parent/parent.types';
import { Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'parent-dashboard',
    templateUrl: './parent-dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatIconModule, MatSelectModule, TranslocoModule],
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
    children: ParentChild[] = [];
    selectedChild: ParentChild | null = null;
    dashboard: ParentDashboardDto | null = null;
    loading = false;
    error: string | null = null;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _parentService: ParentService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this._cdr.markForCheck();

        // Subscribe to children list updates
        this._parentService.children$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((children) => {
                this.children = children;
                this._cdr.markForCheck();
            });

        // Subscribe to selected child and load dashboard on change
        this._parentService.selectedChild$
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((child) => {
                    this.selectedChild = child;
                    this.loading = true;
                    this.error = null;
                    this._cdr.markForCheck();
                    if (!child) {
                        return [];
                    }
                    return this._parentService.getDashboard();
                })
            )
            .subscribe({
                next: (data) => {
                    this.dashboard = data as ParentDashboardDto;
                    console.log(data);
                    this.loading = false;
                    this._cdr.markForCheck();
                },
                error: (err) => {
                    this.error = err?.message ?? 'Error loading dashboard';
                    this.loading = false;
                    this._cdr.markForCheck();
                },
            });

        // Trigger loading children (side effect: populates children$ and selectedChild$)
        this._parentService.loadChildren().subscribe({
            error: (err) => {
                this.error = err?.message ?? 'Error loading children';
                this.loading = false;
                this._cdr.markForCheck();
            },
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onChildChange(child: ParentChild): void {
        this._parentService.selectChild(child);
    }

    get avgRating(): string {
        if (
            this.dashboard?.trainingAvgRating === null ||
            this.dashboard?.trainingAvgRating === undefined
        ) {
            return '–';
        }
        return this.dashboard.trainingAvgRating.toFixed(1);
    }
}
