export type FormulaType = 'MORNING' | 'AFTERNOON' | 'FULL';

export interface CurrentUserDto {
    id: string;
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string | null;
    birthDate?: string | null;
    fftLicenseNumber?: string | null;
    formula?: FormulaType | null;
    notifyEmail: boolean;
    notifySMS: boolean;
    notifyWhatsApp: boolean;
    privacyConsentAt?: string | null;
    photoConsentAt?: string | null;
    marketingConsentAt?: string | null;
}

export interface MeResponse {
    user: CurrentUserDto;
    mustOnboard: boolean;
}

export interface OnboardingDraft {
    profile: {
        firstname: string;
        lastname: string;
        phone?: string;
        birthDate?: string | null; // ISO date
        fftLicenseNumber?: string;
        currentRanking?: number | null;
        avatarFile?: File | null;
        backgroundFile?: File | null;
    };
    contract: {
        notifyEmail: boolean;
        notifySMS: boolean;
        notifyWhatsApp: boolean;
    };
    consents: {
        acceptPrivacy: boolean;
        acceptPhoto: boolean;
        acceptMarketing: boolean;
    };
}

export interface UpdateUserDto {
    firstname?: string;
    lastname?: string;
    phone?: string | null;
    birthDate?: string | null;
    fftLicenseNumber?: string | null;
    notifyEmail?: boolean;
    notifySMS?: boolean;
    notifyWhatsApp?: boolean;
}

export interface UpdateConsentsDto {
    privacyConsent: boolean;
    photoConsent: boolean;
    marketingConsent: boolean;
}
