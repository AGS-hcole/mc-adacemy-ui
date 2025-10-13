import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { catchError, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { OnboardingDraft, UpdateConsentsDto, UpdateUserDto } from './models/onboarding.types';
import { AvatarService } from './services/avatar.service';
import { OnboardingDraftService } from './services/onboarding-draft.service';
import { ConsentsStepComponent } from './steps/consents-step.component';
import { ContractStepComponent } from './steps/contract-step.component';
import { ProfileStepComponent } from './steps/profile-step.component';
import { SummaryStepComponent } from './steps/summary-step.component';

@Component({
    selector: 'onboarding-shell',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSnackBarModule,
        TranslocoModule,
        ProfileStepComponent,
        ContractStepComponent,
        ConsentsStepComponent,
        SummaryStepComponent,
    ],
    templateUrl: './onboarding-shell.component.html',
})
export class OnboardingShellComponent implements OnInit, OnDestroy {
    currentStep = 0;
    steps = ['PROFILE', 'CONTRACT', 'CONSENTS', 'SUMMARY'];
    
    draft: OnboardingDraft = {
        profile: {
            firstname: '',
            lastname: '',
            phone: '',
            birthDate: null,
            fftLicenseNumber: '',
            avatarFile: null,
            backgroundFile: null,
        },
        contract: {
            formula: null,
            notifyEmail: true,
            notifySMS: false,
            notifyWhatsApp: false,
        },
        consents: {
            acceptPrivacy: false,
            acceptPhoto: false,
            acceptMarketing: false,
        },
    };

    currentEmail = '';
    isSubmitting = false;

    // Form references for each step
    private profileForm: FormGroup | null = null;
    private contractForm: FormGroup | null = null;
    private consentsForm: FormGroup | null = null;

    private destroy$ = new Subject<void>();
    private draftService = inject(OnboardingDraftService);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private avatarService = inject(AvatarService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    ngOnInit(): void {
        // Load draft from localStorage
        const savedDraft = this.draftService.loadDraft();
        if (savedDraft) {
            this.draft = { ...this.draft, ...savedDraft };
        }

        // Get current user email from auth
        this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
            if (user?.email) {
                this.currentEmail = user.email;
                // Prefill with existing data
                if (user.firstname) this.draft.profile.firstname = user.firstname;
                if (user.lastname) this.draft.profile.lastname = user.lastname;
                if (user.phone) this.draft.profile.phone = user.phone;
                if (user.birthDate) this.draft.profile.birthDate = new Date(user.birthDate).toISOString().split('T')[0];
                if (user.fftLicenseNumber) this.draft.profile.fftLicenseNumber = user.fftLicenseNumber;
                if (user.formula) this.draft.contract.formula = user.formula as any;
                this.draft.contract.notifyEmail = user.notifyEmail ?? true;
                this.draft.contract.notifySMS = user.notifySMS ?? false;
                this.draft.contract.notifyWhatsApp = user.notifyWhatsApp ?? false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get progress(): number {
        return ((this.currentStep + 1) / this.steps.length) * 100;
    }

    get canGoNext(): boolean {
        switch (this.currentStep) {
            case 0:
                return this.profileForm?.valid ?? false;
            case 1:
                return this.contractForm?.valid ?? false;
            case 2:
                return this.consentsForm?.valid ?? false;
            case 3:
                return true;
            default:
                return false;
        }
    }

    get canGoBack(): boolean {
        return this.currentStep > 0;
    }

    get isLastStep(): boolean {
        return this.currentStep === this.steps.length - 1;
    }

    onProfileChange(event: { form: FormGroup; data: OnboardingDraft['profile'] }): void {
        this.profileForm = event.form;
        this.draft.profile = { ...this.draft.profile, ...event.data };
        this.saveDraft();
    }

    onContractChange(event: { form: FormGroup; data: OnboardingDraft['contract'] }): void {
        this.contractForm = event.form;
        this.draft.contract = event.data;
        this.saveDraft();
    }

    onConsentsChange(event: { form: FormGroup; data: OnboardingDraft['consents'] }): void {
        this.consentsForm = event.form;
        this.draft.consents = event.data;
        this.saveDraft();
    }

    nextStep(): void {
        if (this.canGoNext && this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.saveDraft();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep(): void {
        if (this.canGoBack) {
            this.currentStep--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    private saveDraft(): void {
        this.draftService.saveDraft(this.draft);
    }

    finish(): void {
        if (!this.canGoNext || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;

        // Step 1: Update user profile
        const updateData: UpdateUserDto = {
            firstname: this.draft.profile.firstname,
            lastname: this.draft.profile.lastname,
            phone: this.draft.profile.phone || null,
            birthDate: this.draft.profile.birthDate || null,
            fftLicenseNumber: this.draft.profile.fftLicenseNumber || null,
            formula: this.draft.contract.formula || null,
            notifyEmail: this.draft.contract.notifyEmail,
            notifySMS: this.draft.contract.notifySMS,
            notifyWhatsApp: this.draft.contract.notifyWhatsApp,
        };

        this.userService.updateMe(updateData)
            .pipe(
                // Step 2: Upload avatar if provided
                switchMap(() => {
                    if (this.draft.profile.avatarFile) {
                        return this.userService.uploadAvatar(this.draft.profile.avatarFile);
                    }
                    return of(null);
                }),
                // Step 3: Upload background if provided
                switchMap(() => {
                    if (this.draft.profile.backgroundFile) {
                        return this.userService.uploadBackground(this.draft.profile.backgroundFile);
                    }
                    return of(null);
                }),
                // Step 4: Update consents
                switchMap(() => {
                    const consentsData: UpdateConsentsDto = {
                        privacyConsent: this.draft.consents.acceptPrivacy,
                        photoConsent: this.draft.consents.acceptPhoto,
                        marketingConsent: this.draft.consents.acceptMarketing,
                    };
                    return this.userService.updateConsents(consentsData);
                }),
                // Step 5: Refetch user to update mustOnboard flag
                switchMap(() => this.authService.getMe()),
                catchError(error => {
                    console.error('Onboarding submission failed:', error);
                    this.snackBar.open(
                        this.getTranslation('ONBOARDING.ERROR'),
                        '',
                        { duration: 5000, panelClass: ['error-snackbar'] }
                    );
                    this.isSubmitting = false;
                    return of(null);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe(response => {
                if (response) {
                    // Clear draft
                    this.draftService.clearDraft();

                    // Show success message
                    this.snackBar.open(
                        this.getTranslation('ONBOARDING.SUCCESS'),
                        '',
                        { duration: 3000, panelClass: ['success-snackbar'] }
                    );

                    // Redirect to dashboard
                    setTimeout(() => {
                        this.router.navigate(['/']);
                    }, 1000);
                }
            });
    }

    private getTranslation(key: string): string {
        // Simple fallback for translation (Transloco handles this better in template)
        return key.split('.').pop() || key;
    }
}
