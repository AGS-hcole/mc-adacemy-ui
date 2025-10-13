import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import { AvatarService } from '../services/avatar.service';
import { OnboardingDraft } from '../models/onboarding.types';

@Component({
    selector: 'onboarding-profile-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        TranslocoModule,
    ],
    templateUrl: './profile-step.component.html',
})
export class ProfileStepComponent implements OnInit {
    @Input() draft: OnboardingDraft['profile'] | null = null;
    @Input() email: string = '';
    @Output() formChange = new EventEmitter<{ form: FormGroup; data: OnboardingDraft['profile'] }>();

    form!: FormGroup;
    avatarPreview: string | null = null;
    backgroundPreview: string | null = null;
    avatarFile: File | null = null;
    backgroundFile: File | null = null;
    
    private fb = inject(FormBuilder);
    private avatarService = inject(AvatarService);

    readonly maxBirthDate = new Date();
    readonly minBirthDate = new Date('1900-01-01');

    ngOnInit(): void {
        this.form = this.fb.group({
            firstname: [this.draft?.firstname || '', [Validators.required, Validators.minLength(2)]],
            lastname: [this.draft?.lastname || '', [Validators.required, Validators.minLength(2)]],
            phone: [this.draft?.phone || '', Validators.pattern(/^\+?[0-9\s.-]{7,15}$/)],
            birthDate: [this.draft?.birthDate ? new Date(this.draft.birthDate) : null],
            fftLicenseNumber: [this.draft?.fftLicenseNumber || ''],
        });

        // Emit initial state
        this.emitFormState();

        // Listen to form changes
        this.form.valueChanges.subscribe(() => {
            this.emitFormState();
        });
    }

    onAvatarSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const validation = this.avatarService.validateImage(file, 2);
            
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            this.avatarFile = file;
            this.avatarService.readFileAsDataUrl(file).subscribe(dataUrl => {
                this.avatarPreview = dataUrl;
                this.emitFormState();
            });
        }
    }

    onBackgroundSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const validation = this.avatarService.validateImage(file, 4);
            
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            this.backgroundFile = file;
            this.avatarService.readFileAsDataUrl(file).subscribe(dataUrl => {
                this.backgroundPreview = dataUrl;
                this.emitFormState();
            });
        }
    }

    removeAvatar(): void {
        this.avatarPreview = null;
        this.avatarFile = null;
        this.emitFormState();
    }

    removeBackground(): void {
        this.backgroundPreview = null;
        this.backgroundFile = null;
        this.emitFormState();
    }

    private emitFormState(): void {
        const formValue = this.form.value;
        const data: OnboardingDraft['profile'] = {
            firstname: formValue.firstname || '',
            lastname: formValue.lastname || '',
            phone: formValue.phone || '',
            birthDate: formValue.birthDate ? formValue.birthDate.toISOString().split('T')[0] : null,
            fftLicenseNumber: formValue.fftLicenseNumber || '',
            avatarFile: this.avatarFile,
            backgroundFile: this.backgroundFile,
        };

        this.formChange.emit({ form: this.form, data });
    }
}
