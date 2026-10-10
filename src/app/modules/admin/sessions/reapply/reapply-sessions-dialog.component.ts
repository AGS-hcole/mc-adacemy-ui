import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import { ReapplySessionsResult } from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { DateTime } from 'luxon';

@Component({
    selector: 'admin-reapply-sessions-dialog',
    templateUrl: './reapply-sessions-dialog.component.html',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoModule,
    ],
})
export class ReapplySessionsDialogComponent {
    private readonly sessions = inject(SessionsService);
    readonly dialogRef = inject(MatDialogRef<ReapplySessionsDialogComponent>);
    readonly form = new FormGroup(
        {
            startDate: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
            }),
            endDate: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
            }),
        },
        {
            validators: (control) => {
                const { startDate, endDate } = control.value;
                if (!startDate || !endDate) return null;
                const valid = (value: string) =>
                    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
                    DateTime.fromISO(value).isValid;
                return valid(startDate) &&
                    valid(endDate) &&
                    startDate <= endDate
                    ? null
                    : { dateRange: true };
            },
        }
    );
    pending = false;
    result: ReapplySessionsResult | null = null;
    failed = false;
    errorDetails = '';
    changed = false;

    submit(): void {
        if (this.pending || this.result) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        this.pending = true;
        this.failed = false;
        this.errorDetails = '';
        this.dialogRef.disableClose = true;
        const request = this.form.getRawValue();
        this.form.disable();
        this.sessions.reapplyParticipants(request).subscribe({
            next: (result) => {
                this.result = result;
                this.changed = true;
                this.dialogRef.disableClose = false;
                this.pending = false;
            },
            error: (error: HttpErrorResponse) => {
                const message = error.error?.message;
                this.errorDetails = Array.isArray(message)
                    ? message
                          .filter((item) => typeof item === 'string')
                          .join('\n')
                    : typeof message === 'string'
                      ? message
                      : '';
                this.failed = true;
                this.pending = false;
                this.dialogRef.disableClose = false;
                this.form.enable();
            },
        });
    }
}
