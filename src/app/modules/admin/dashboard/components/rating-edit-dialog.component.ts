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
import { MatSliderModule } from '@angular/material/slider';
import { TranslocoModule } from '@jsverse/transloco';

export interface RatingEditDialogData {
    participantName: string;
    score: number;
    comment?: string;
}

export interface RatingEditDialogResult {
    score: number;
    comment: string;
}

@Component({
    selector: 'rating-edit-dialog',
    templateUrl: './rating-edit-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        MatButtonModule,
        TranslocoModule,
    ],
})
export class RatingEditDialogComponent {
    score: number;
    comment: string;
    maxLength = 2000;

    constructor(
        public dialogRef: MatDialogRef<RatingEditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RatingEditDialogData
    ) {
        this.score = data.score;
        this.comment = data.comment || '';
    }

    /**
     * Save and close dialog
     */
    save(): void {
        const result: RatingEditDialogResult = {
            score: this.score,
            comment: this.comment,
        };
        this.dialogRef.close(result);
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

    /**
     * Format label for score slider
     */
    formatLabel(value: number): string {
        return `${value}/10`;
    }
}
