import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';

export interface RatingCommentDialogData {
    participantName: string;
    comment?: string;
}

@Component({
    selector: 'rating-comment-dialog',
    templateUrl: './rating-comment-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        TranslocoModule,
    ],
})
export class RatingCommentDialogComponent {
    comment: string;
    maxLength = 2000;

    constructor(
        public dialogRef: MatDialogRef<RatingCommentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RatingCommentDialogData
    ) {
        this.comment = data.comment || '';
    }

    /**
     * Save and close dialog
     */
    save(): void {
        this.dialogRef.close(this.comment);
    }

    /**
     * Cancel and close dialog
     */
    cancel(): void {
        this.dialogRef.close();
    }

    /**
     * Get remaining characters
     */
    getRemainingChars(): number {
        return this.maxLength - (this.comment?.length || 0);
    }
}
