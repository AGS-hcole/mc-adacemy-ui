import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ResidenceApi } from 'app/core/api/residence.api';
import { ManorDto } from 'app/core/models/residence.models';
import { Subject, takeUntil } from 'rxjs';
import { ManorEditDrawerComponent } from '../edit-drawer/edit-drawer.component';

@Component({
    selector: 'admin-manors-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        NgIf,
        NgFor,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class ManorsAdminListComponent implements OnInit, OnDestroy {
    manors: ManorDto[] = [];
    loading = false;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _residenceApi: ResidenceApi,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService
    ) {}

    ngOnInit(): void {
        this.loadManors();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    loadManors(): void {
        this.loading = true;
        this._residenceApi
            .listManors(false) // Load all manors including inactive
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (manors) => {
                    this.manors = manors;
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
    }

    createManor(): void {
        const dialogRef = this._matDialog.open(ManorEditDrawerComponent, {
            width: '640px',
            maxWidth: '90vw',
            position: { right: '0' },
            height: '100%',
            panelClass: 'manor-edit-drawer',
            data: { manor: null },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'saved') {
                this.loadManors();
            }
        });
    }

    editManor(manor: ManorDto): void {
        const dialogRef = this._matDialog.open(ManorEditDrawerComponent, {
            width: '640px',
            maxWidth: '90vw',
            position: { right: '0' },
            height: '100%',
            panelClass: 'manor-edit-drawer',
            data: { manor },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'saved') {
                this.loadManors();
            }
        });
    }

    deleteManor(manor: ManorDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate(
                'ADMIN.MANORS.ACTIONS.DELETE_CONFIRM'
            ),
            message: this._translocoService.translate(
                'ADMIN.MANORS.ACTIONS.DELETE_MESSAGE',
                { name: manor.name }
            ),
            actions: {
                confirm: {
                    label: this._translocoService.translate('COMMON.CONFIRM'),
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._residenceApi
                    .deleteManor(manor.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => {
                        this.loadManors();
                    });
            }
        });
    }

    trackByFn(index: number, item: ManorDto): string {
        return item.id;
    }
}
