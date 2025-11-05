import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { EventsApi } from 'app/core/api/events.api';
import { PublicEvent } from 'app/core/models/public-event.model';
import { QrDialogComponent } from '../qr-dialog/qr-dialog.component';

@Component({
    selector: 'admin-event-form',
    templateUrl: './form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,
        TranslocoModule,
    ],
})
export class AdminEventFormComponent implements OnInit {
    eventForm: FormGroup;
    isEditMode = false;
    eventId: string | null = null;

    constructor(
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _eventsApi: EventsApi,
        private _changeDetectorRef: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Create form
        this.eventForm = this._formBuilder.group({
            name: ['', Validators.required],
            slug: [''],
            description: [''],
            startTime: [''],
            endTime: [''],
            backgroundImageUrl: [''],
            externalRegistrationUrl: [''],
            isPublished: [false],
            orderIndex: [0, Validators.required],
        });

        // Check if edit mode
        const event = this._activatedRoute.snapshot.data[
            'event'
        ] as PublicEvent;
        if (event) {
            this.isEditMode = true;
            this.eventId = event.id;
            this.patchFormWithEvent(event);
        }

        // Add end time validation
        this.eventForm
            .get('endTime')
            ?.valueChanges.subscribe(() => this.validateEndTime());
    }

    /**
     * Patch form with event data
     */
    patchFormWithEvent(event: PublicEvent): void {
        this.eventForm.patchValue({
            name: event.name,
            slug: event.slug,
            description: event.description || '',
            startTime: event.startTime
                ? this.formatDateTimeLocal(event.startTime)
                : '',
            endTime: event.endTime
                ? this.formatDateTimeLocal(event.endTime)
                : '',
            backgroundImageUrl: event.backgroundImageUrl || '',
            externalRegistrationUrl: event.externalRegistrationUrl || '',
            isPublished: event.isPublished,
            orderIndex: event.orderIndex,
        });
    }

    /**
     * Format datetime for input datetime-local
     */
    formatDateTimeLocal(isoString: string): string {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    /**
     * Validate end time is after start time
     */
    validateEndTime(): void {
        const startTime = this.eventForm.get('startTime')?.value;
        const endTime = this.eventForm.get('endTime')?.value;

        if (startTime && endTime && new Date(endTime) < new Date(startTime)) {
            this.eventForm.get('endTime')?.setErrors({ invalidEndTime: true });
        }
    }

    /**
     * Save event
     */
    save(): void {
        if (this.eventForm.invalid) {
            return;
        }

        const formValue = this.eventForm.value;
        const dto: Partial<PublicEvent> = {
            name: formValue.name,
            slug: formValue.slug || undefined,
            description: formValue.description || null,
            startTime: formValue.startTime || null,
            endTime: formValue.endTime || null,
            backgroundImageUrl: formValue.backgroundImageUrl || null,
            externalRegistrationUrl: formValue.externalRegistrationUrl || null,
            isPublished: formValue.isPublished,
            orderIndex: formValue.orderIndex,
        };

        const request = this.isEditMode
            ? this._eventsApi.update(this.eventId!, dto)
            : this._eventsApi.create(dto);

        request.subscribe({
            next: () => {
                this._snackBar.open(
                    this._translocoService.translate(
                        this.isEditMode
                            ? 'EVENTS.ADMIN.UPDATE_SUCCESS'
                            : 'EVENTS.ADMIN.CREATE_SUCCESS'
                    ),
                    'OK',
                    { duration: 3000 }
                );
                this._router.navigate(['/admin/events']);
            },
            error: (error) => {
                console.error('Error saving event:', error);
                this._snackBar.open(
                    this._translocoService.translate('EVENTS.ADMIN.SAVE_ERROR'),
                    'OK',
                    { duration: 3000 }
                );
            },
        });
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['/admin/events']);
    }

    /**
     * Open public preview
     */
    openPreview(): void {
        window.open('/events', '_blank', 'noopener,noreferrer');
    }

    /**
     * Generate QR code
     */
    generateQr(): void {
        const url = `${window.location.origin}/events`;
        this._matDialog.open(QrDialogComponent, {
            width: '400px',
            data: { url },
        });
    }
}
