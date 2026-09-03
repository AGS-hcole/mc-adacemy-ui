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
import { TranslocoModule } from '@jsverse/transloco';
import { ParentService } from 'app/core/parent/parent.service';
import { ParentChild } from 'app/core/parent/parent.types';
import { ReportsDashboardComponent } from 'app/modules/admin/reports/dashboard/reports-dashboard.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'parent-reports',
    templateUrl: './parent-reports.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        TranslocoModule,
        ReportsDashboardComponent,
    ],
})
export class ParentReportsComponent implements OnInit, OnDestroy {
    children: ParentChild[] = [];
    childId: string | null = null;
    loading = true;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _parentService: ParentService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loading = true;

        // Subscribe to the children list
        this._parentService.children$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((children) => {
                this.children = children;
                this._cdr.markForCheck();
            });

        // Subscribe to selected child independently
        this._parentService.selectedChild$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((child) => {
                this.childId = child?.id ?? null;
                this.loading = false;
                this._cdr.markForCheck();
            });

        // Trigger loading children (side effect: populates children$ and selectedChild$)
        this._parentService.loadChildren().subscribe({
            error: () => {
                this.loading = false;
                this._cdr.markForCheck();
            },
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * Select the child to examine in the reports dashboard
     */
    onChildChange(child: ParentChild): void {
        this._parentService.selectChild(child);
    }
}

