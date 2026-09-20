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
import { ParentDashboardChildStats } from 'app/core/parent/parent.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'parent-dashboard',
    templateUrl: './parent-dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatIconModule, MatSelectModule, TranslocoModule],
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
    children: ParentDashboardChildStats[] = [];
    selectedChildId: string | null = null;
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

        this._parentService
            .getDashboard()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (data) => {
                    this.children = data.children ?? [];
                    this.selectedChildId = this.children[0]?.child.id ?? null;
                    this.loading = false;
                    this._cdr.markForCheck();
                },
                error: (err) => {
                    this.error = err?.message ?? 'Error loading dashboard';
                    this.loading = false;
                    this._cdr.markForCheck();
                },
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onChildChange(child: ParentDashboardChildStats): void {
        this.selectedChildId = child.child.id;
    }

    get selectedChild(): ParentDashboardChildStats | null {
        return (
            this.children.find(
                (child) => child.child.id === this.selectedChildId
            ) ?? null
        );
    }

    get selectedChildDisplayName(): string {
        if (!this.selectedChild) {
            return '';
        }
        return `${this.selectedChild.child.firstname} ${this.selectedChild.child.lastname}`;
    }

    get avgRating(): string {
        const average = this.selectedChild?.ratings?.average;
        if (average === null || average === undefined) {
            return '–';
        }
        return average.toFixed(1);
    }
}
