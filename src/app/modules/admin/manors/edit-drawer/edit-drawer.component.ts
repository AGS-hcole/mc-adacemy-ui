import { NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ResidenceApi } from 'app/core/api/residence.api';
import { ManorDto } from 'app/core/models/residence.models';

@Component({
    selector: 'manor-edit-drawer',
    templateUrl: './edit-drawer.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
        TranslocoModule,
    ],
})
export class ManorEditDrawerComponent implements OnInit {
    manorForm!: FormGroup;
    isEditMode = false;

    constructor(
        private _fb: FormBuilder,
        private _residenceApi: ResidenceApi,
        private _dialogRef: MatDialogRef<ManorEditDrawerComponent>,
        private _snackBar: MatSnackBar,
        private _translocoService: TranslocoService,
        @Inject(MAT_DIALOG_DATA) public data: { manor: ManorDto | null }
    ) {}

    ngOnInit(): void {
        this.isEditMode = !!this.data.manor;

        this.manorForm = this._fb.group({
            name: [this.data.manor?.name || '', [Validators.required]],
            address: [this.data.manor?.address || ''],
            city: [this.data.manor?.city || ''],
            capacity: [
                this.data.manor?.capacity || 0,
                [Validators.required, Validators.min(0)],
            ],
            enforceCapacity: [this.data.manor?.enforceCapacity ?? true],
            isActive: [this.data.manor?.isActive ?? true],
        });
    }

    save(): void {
        if (this.manorForm.invalid) {
            return;
        }

        const payload = this.manorForm.value;

        const request$ = this.isEditMode
            ? this._residenceApi.updateManor(this.data.manor!.id, payload)
            : this._residenceApi.createManor(payload);

        request$.subscribe({
            next: () => {
                this._snackBar.open(
                    this._translocoService.translate('ADMIN.MANORS.SAVED'),
                    '',
                    { duration: 3000 }
                );
                this._dialogRef.close('saved');
            },
            error: () => {
                this._snackBar.open(
                    this._translocoService.translate('ADMIN.MANORS.ERROR'),
                    '',
                    { duration: 3000 }
                );
            },
        });
    }

    cancel(): void {
        if (this.manorForm.dirty) {
            const confirmLeave = confirm(
                this._translocoService.translate(
                    'ADMIN.MANORS.CONFIRM_DISCARD'
                )
            );
            if (!confirmLeave) {
                return;
            }
        }
        this._dialogRef.close();
    }
}
