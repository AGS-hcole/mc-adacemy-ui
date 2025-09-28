// user.model.ts
export type UUID = string;

export enum Role {
    user = 'user',
    admin = 'admin',
}

export enum FormulaType {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON',
    FULL = 'FULL',
}

export interface User {
    id: UUID;
    role: Role;

    // Identity
    firstname: string;
    lastname: string;
    email: string;
    phone?: string | null;
    birthDate?: Date | null;
    fftLicenseNumber?: string | null;

    // Contract / formula
    formula?: FormulaType | null;

    // Security (password not included in frontend model for security)
    
    // Consents (RGPD)
    privacyConsentAt?: Date | null;
    photoConsentAt?: Date | null;
    marketingConsentAt?: Date | null;

    // Images stored in DB (Bytes in Prisma, but handled as base64 strings in frontend)
    avatarData?: string | null; // base64 encoded
    avatarMime?: string | null;
    backgroundData?: string | null; // base64 encoded
    backgroundMime?: string | null;

    // Notifications preferences
    notifyEmail: boolean;
    notifySMS: boolean;
    notifyWhatsApp: boolean;

    // Timestamps
    createdAt: Date;
    updatedAt?: Date | null;

    // UI helpers (derived)
    displayName: string; // `${firstname} ${lastname}`
    isAdmin: boolean; // role === 'admin'
    avatarUrl?: string | null; // `data:${avatarMime};base64,${avatarData}`
}
