import { Directive, HostListener, Input, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

@Directive({
    selector: '[copyToClipboard]',
    standalone: true,
})
export class CopyToClipboardDirective {
    @Input('copyToClipboard') valueToCopy!: string;

    private snackBar = inject(MatSnackBar);
    private transloco = inject(TranslocoService);

    @HostListener('click')
    copyText(): void {
        if (!this.valueToCopy) return;

        navigator.clipboard
            .writeText(this.valueToCopy)
            .then(() => {
                const successMessage = this.transloco.translate(
                    'SHARED.CLIPBOARD.SUCCESS'
                );
                this.snackBar.open(successMessage, undefined, {
                    duration: 2000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            })
            .catch(() => {
                const errorMessage = this.transloco.translate(
                    'SHARED.CLIPBOARD.ERROR'
                );
                this.snackBar.open(errorMessage, undefined, {
                    duration: 2000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            });
    }
}
