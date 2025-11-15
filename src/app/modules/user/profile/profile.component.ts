import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AvatarService } from 'app/modules/onboarding/services/avatar.service';
import { finalize } from 'rxjs/operators';
import {
    UserSessionFeedViewItem,
    UserSessionFeedItem,
} from './models/user-session-feed.types';
import { UserSessionFeedService } from './services/user-session-feed.service';

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
        MatSlideToggleModule,
        RouterLink,
        MatCheckboxModule,
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

    // Session feed properties
    sessionFeedItems: UserSessionFeedViewItem[] = [];
    isLoadingFeed = false;
    isLoadingMore = false;
    feedError: string | null = null;
    feedHasMore = true;
    private feedCursor: string | null = null;
    private readonly feedPageSize = 10;

    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private avatarService = inject(AvatarService);
    private sessionFeedService = inject(UserSessionFeedService);
    private _activatedRoute = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);
    private _translocoService = inject(TranslocoService);

    readonly maxBirthDate = new Date();
    readonly minBirthDate = new Date('1900-01-01');

    ngOnInit(): void {
        // Get user from resolver
        this.userService.user$.subscribe((user) => {
            this.user = user;
            this.initializeForm(user);
            this.loadUserImages();
            // Load session feed after user is loaded
            this.loadInitialFeed();
        });
    }

    private loadUserImages(): void {
        // Load avatar from API endpoint
        this.userService.getAvatarBlob().subscribe({
            next: (blob) => {
                if (blob && blob.size > 0) {
                    this.avatarPreview = URL.createObjectURL(blob);
                }
            },
            error: (error) => {
                console.log(
                    'No avatar available or error loading avatar:',
                    error
                );
                // No avatar, use default
                this.avatarPreview = null;
            },
        });

        // Load background from API endpoint
        this.userService.getBackgroundBlob().subscribe({
            next: (blob) => {
                if (blob && blob.size > 0) {
                    this.backgroundPreview = URL.createObjectURL(blob);
                }
            },
            error: (error) => {
                console.log(
                    'No background available or error loading background:',
                    error
                );
                // No background, use default gradient
                this.backgroundPreview = null;
            },
        });
    }

    private initializeForm(user: User): void {
        console.log(user);
        this.form = this.fb.group({
            firstname: [
                user.firstname || '',
                [Validators.required, Validators.minLength(2)],
            ],
            lastname: [
                user.lastname || '',
                [Validators.required, Validators.minLength(2)],
            ],
            email: [{ value: user.email || '', disabled: true }],
            phone: [
                user.phone || '',
                Validators.pattern(/^\+?[0-9\s.-]{7,15}$/),
            ],
            birthDate: [user.birthDate ? new Date(user.birthDate) : null],
            fftLicenseNumber: [user.fftLicenseNumber || ''],
            currentRanking: [user.currentRanking || ''],
            // Notification preferences
            notifyEmail: [user.notifyEmail || false],
            notifySMS: [user.notifySMS || false],
            notifyWhatsApp: [user.notifyWhatsApp || false],
            // Consents
            privacyConsent: [!!user.privacyConsentAt],
            photoConsent: [!!user.photoConsentAt],
            marketingConsent: [!!user.marketingConsentAt],
        });
    }

    /**
     * Load initial session feed
     */
    private loadInitialFeed(): void {
        this.sessionFeedItems = [];
        this.feedCursor = null;
        this.feedHasMore = true;
        this.feedError = null;
        this.fetchNextFeedPage(true);
    }

    /**
     * Fetch next page of session feed
     */
    private fetchNextFeedPage(isInitial = false): void {
        if (this.isLoadingFeed || this.isLoadingMore || !this.feedHasMore) {
            return;
        }

        this.feedError = null;
        if (isInitial) {
            this.isLoadingFeed = true;
        } else {
            this.isLoadingMore = true;
        }

        const params = {
            cursor: this.feedCursor || undefined,
            limit: this.feedPageSize,
            direction: 'past' as const,
        };

        const request$ = this.isCurrentUser
            ? this.sessionFeedService.getMySessionsFeed(params)
            : this.sessionFeedService.getUserSessionsFeed(
                  this.user!.id,
                  params
              );

        request$
            .pipe(
                finalize(() => {
                    this.isLoadingFeed = false;
                    this.isLoadingMore = false;
                })
            )
            .subscribe({
                next: (resp) => {
                    const newItems = resp.items.map((item) =>
                        this.mapToViewItem(item)
                    );
                    this.sessionFeedItems = [
                        ...this.sessionFeedItems,
                        ...newItems,
                    ];
                    this.feedCursor = resp.nextCursor;
                    this.feedHasMore = resp.hasMore;
                },
                error: (error) => {
                    console.error('Error loading session feed', error);
                    this.feedError = this._translocoService.translate(
                        'PROFILE.ACTIVITY.ERROR'
                    );
                },
            });
    }

    /**
     * Map API item to view item with computed properties
     */
    private mapToViewItem(
        item: UserSessionFeedItem
    ): UserSessionFeedViewItem {
        return {
            ...item,
            dateObj: new Date(item.date),
            userStatusLabel: this._translocoService.translate(
                `PROFILE.SESSION_STATUS.${item.userStatus}`
            ),
            sessionTypeLabel: this._translocoService.translate(
                `PROFILE.SESSION_TYPE.${item.sessionType}`
            ),
        };
    }

    /**
     * Handle scroll event for infinite scroll
     */
    onFeedScroll(event: Event): void {
        const target = event.target as HTMLElement;
        const threshold = 150; // px before the bottom

        if (!this.feedHasMore || this.isLoadingMore || this.isLoadingFeed) {
            return;
        }

        const position = target.scrollTop + target.clientHeight;
        const height = target.scrollHeight;

        if (height - position < threshold) {
            this.fetchNextFeedPage(false);
        }
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
            this.avatarService.readFileAsDataUrl(file).subscribe((dataUrl) => {
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
            this.avatarService.readFileAsDataUrl(file).subscribe((dataUrl) => {
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
            birthDate: formValue.birthDate
                ? formValue.birthDate.toISOString().split('T')[0]
                : null,
            fftLicenseNumber: formValue.fftLicenseNumber || null,
            currentRanking: formValue.currentRanking || null,
            notifyEmail: formValue.notifyEmail,
            notifySMS: formValue.notifySMS,
            notifyWhatsApp: formValue.notifyWhatsApp,
        };

        // Update user profile
        this.userService
            .updateMe(updateData)
            .pipe(
                finalize(() => {
                    // Upload avatar if provided
                    if (this.avatarFile) {
                        this.userService
                            .uploadAvatar(this.avatarFile)
                            .subscribe({
                                next: () => {
                                    this.loadUserImages();
                                },
                                error: (error) => {
                                    console.error(
                                        'Error uploading avatar:',
                                        error
                                    );
                                },
                            });
                    }

                    // Upload background if provided
                    if (this.backgroundFile) {
                        this.userService
                            .uploadBackground(this.backgroundFile)
                            .subscribe({
                                next: () => {
                                    this.loadUserImages();
                                },
                                error: (error) => {
                                    console.error(
                                        'Error uploading background:',
                                        error
                                    );
                                },
                            });
                    }

                    // Update consents if current user
                    if (this.isCurrentUser) {
                        const consentsData = {
                            privacyConsent: formValue.privacyConsent,
                            photoConsent: formValue.photoConsent,
                            marketingConsent: formValue.marketingConsent,
                        };
                        this.userService
                            .updateConsents(consentsData)
                            .subscribe({
                                next: () => {},
                                error: (error) => {
                                    console.error(
                                        'Error updating consents:',
                                        error
                                    );
                                },
                            });
                    }

                    this.isSaving = false;
                    this.editMode = false;
                })
            )
            .subscribe({
                next: () => {
                    // Show success message
                    this.snackBar.open(
                        this._translocoService.translate(
                            'PROFILE.UPDATE_SUCCESS'
                        ),
                        '',
                        {
                            duration: 3000,
                            verticalPosition: 'top',
                            panelClass: ['success-snackbar'],
                        }
                    );

                    // Toggle edit mode off
                    this.toggleEditMode();
                },
                error: (error) => {
                    console.error('Error updating profile:', error);
                    // Show error message
                    this.snackBar.open(
                        this._translocoService.translate(
                            'PROFILE.UPDATE_ERROR'
                        ),
                        '',
                        {
                            duration: 3000,
                            verticalPosition: 'top',
                            panelClass: ['error-snackbar'],
                        }
                    );
                    this.isSaving = false;
                },
            });
    }
}
