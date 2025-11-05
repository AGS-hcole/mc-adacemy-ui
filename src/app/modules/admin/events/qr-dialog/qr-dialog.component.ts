import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { EventsApi } from 'app/core/api/events.api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'qr-dialog',
    templateUrl: './qr-dialog.component.html',
    styleUrls: ['./qr-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslocoModule,
    ],
})
export class QrDialogComponent implements OnInit {
    qrImageUrl: SafeUrl | null = null;
    loading = true;
    error = false;

    constructor(
        public dialogRef: MatDialogRef<QrDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { url: string },
        private _eventsApi: EventsApi,
        private _sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.loadQrCode();
    }

    /**
     * Load QR code from API
     */
    loadQrCode(): void {
        this._eventsApi.getQrPng(this.data.url).subscribe({
            next: (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                this.qrImageUrl =
                    this._sanitizer.bypassSecurityTrustUrl(objectUrl);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading QR code:', error);
                this.error = true;
                this.loading = false;
            },
        });
    }

    /**
     * Download QR code
     */
    download(): void {
        if (!this.qrImageUrl) return;

        this._eventsApi.getQrPng(this.data.url).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'events-qr.png';
                link.click();
                window.URL.revokeObjectURL(url);
            },
        });
    }

    /**
     * Close dialog
     */
    close(): void {
        this.dialogRef.close();
    }
}
