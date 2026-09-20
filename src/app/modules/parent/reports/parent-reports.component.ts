import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ParentService } from 'app/core/parent/parent.service';
import { ReportsDashboardComponent } from 'app/modules/admin/reports/dashboard/reports-dashboard.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'parent-reports',
    template: `
        <reports-dashboard
            *ngIf="childId"
            [lockedUserId]="childId"
        ></reports-dashboard>
        <div *ngIf="!childId && !loading" class="flex flex-auto items-center justify-center p-12 text-secondary">
            {{ 'PARENT.REPORTS.NO_CHILD' | transloco }}
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, TranslocoModule, ReportsDashboardComponent],
})
export class ParentReportsComponent implements OnInit, OnDestroy {
    childId: string | null = null;
    loading = true;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _parentService: ParentService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loading = true;

        // Subscribe to selected child independently
        this._parentService.selectedChild$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((child) => {
                this.childId = child?.id ?? null;
                this.loading = false;
                this._cdr.markForCheck();
            });

        // Trigger loading children (side effect: populates selectedChild$)
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
}
