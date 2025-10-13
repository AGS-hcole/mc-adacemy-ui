import { Injectable } from '@angular/core';
import { OnboardingDraft } from '../models/onboarding.types';

const STORAGE_KEY = 'onboarding:v1';

@Injectable({ providedIn: 'root' })
export class OnboardingDraftService {
    /**
     * Load draft from localStorage
     */
    loadDraft(): OnboardingDraft | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return null;
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to load onboarding draft:', error);
            return null;
        }
    }

    /**
     * Save draft to localStorage (partial update)
     */
    saveDraft(draft: Partial<OnboardingDraft>): void {
        try {
            const existing = this.loadDraft() || this.getEmptyDraft();
            const updated = {
                ...existing,
                ...draft,
                profile: { ...existing.profile, ...(draft.profile || {}) },
                contract: { ...existing.contract, ...(draft.contract || {}) },
                consents: { ...existing.consents, ...(draft.consents || {}) },
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save onboarding draft:', error);
        }
    }

    /**
     * Clear draft from localStorage
     */
    clearDraft(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear onboarding draft:', error);
        }
    }

    /**
     * Get empty draft structure
     */
    private getEmptyDraft(): OnboardingDraft {
        return {
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
    }
}
