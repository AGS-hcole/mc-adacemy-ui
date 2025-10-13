import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AvatarService } from 'app/modules/onboarding/services/avatar.service';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

interface FeedItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    date: Date;
}

@Component({
    selector: 'user-profile',
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
        MatProgressSpinnerModule,
        TranslocoModule,
    ],
    templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
    form!: FormGroup;
    user: User | null = null;
    avatarPreview: string | null = null;
    backgroundPreview: string | null = null;
    avatarFile: File | null = null;
    backgroundFile: File | null = null;
    isSaving = false;
    editMode = false;
    isCurrentUser = true; // For now, always true since we're viewing our own profile
    feed$: Observable<FeedItem[]> = of([]); // Placeholder for future implementation
    
    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private avatarService = inject(AvatarService);

    readonly maxBirthDate = new Date();
    readonly minBirthDate = new Date('1900-01-01');

    ngOnInit(): void {
        this.userService.user$.subscribe(user => {
            if (user) {
                this.user = user;
                this.initializeForm(user);
                
                // Set avatar preview from existing data
                if (user.avatarUrl) {
                    this.avatarPreview = user.avatarUrl;
                }
            }
        });

        // Initialize placeholder feed
        // TODO: Replace with actual API call to get user sessions and tournament results
        this.initializeFeed();
    }

    private initializeForm(user: User): void {
        this.form = this.fb.group({
            firstname: [user.firstname || '', [Validators.required, Validators.minLength(2)]],
            lastname: [user.lastname || '', [Validators.required, Validators.minLength(2)]],
            email: [{ value: user.email || '', disabled: true }],
            phone: [user.phone || '', Validators.pattern(/^\+?[0-9\s.-]{7,15}$/)],
            birthDate: [user.birthDate ? new Date(user.birthDate) : null],
            fftLicenseNumber: [user.fftLicenseNumber || ''],
        });
    }

    private initializeFeed(): void {
        // Placeholder data - will be replaced with real API data
        // TODO: Fetch actual sessions and tournament results from backend
        const placeholderFeed: FeedItem[] = [
            // Empty for now, will be populated when sessions and tournaments are added
        ];
        this.feed$ = of(placeholderFeed);
    }

    toggleEditMode(): void {
        this.editMode = !this.editMode;
        if (!this.editMode && this.user) {
            // Reset form when canceling edit
            this.initializeForm(this.user);
        }
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
            });
        }
    }

    removeAvatar(): void {
        this.avatarPreview = null;
        this.avatarFile = null;
    }

    removeBackground(): void {
        this.backgroundPreview = null;
        this.backgroundFile = null;
    }

    onSubmit(): void {
        if (this.form.invalid || this.isSaving) {
            return;
        }

        this.isSaving = true;
        const formValue = this.form.getRawValue();

        const updateData = {
            firstname: formValue.firstname,
            lastname: formValue.lastname,
            phone: formValue.phone || null,
            birthDate: formValue.birthDate ? formValue.birthDate.toISOString().split('T')[0] : null,
            fftLicenseNumber: formValue.fftLicenseNumber || null,
        };

        // Update user profile
        this.userService.updateMe(updateData)
            .pipe(
                finalize(() => {
                    // Upload avatar if provided
                    if (this.avatarFile) {
                        this.userService.uploadAvatar(this.avatarFile).subscribe({
                            next: () => {
                                console.log('Avatar uploaded successfully');
                            },
                            error: (error) => {
                                console.error('Error uploading avatar:', error);
                            }
                        });
                    }

                    // Upload background if provided
                    if (this.backgroundFile) {
                        this.userService.uploadBackground(this.backgroundFile).subscribe({
                            next: () => {
                                console.log('Background uploaded successfully');
                            },
                            error: (error) => {
                                console.error('Error uploading background:', error);
                            }
                        });
                    }

                    this.isSaving = false;
                    this.editMode = false;
                })
            )
            .subscribe({
                next: () => {
                    alert('Profile updated successfully!');
                },
                error: (error) => {
                    console.error('Error updating profile:', error);
                    alert('Error updating profile. Please try again.');
                    this.isSaving = false;
                }
            });
    }
}
