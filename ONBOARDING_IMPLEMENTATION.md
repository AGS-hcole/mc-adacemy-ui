# Onboarding Flow Implementation

## Overview

This document describes the complete onboarding flow implementation for the MC Academy UI application. The onboarding flow ensures that every newly created user completes their profile, accepts legal consents, and configures notification preferences on their first login.

## Architecture

### Tech Stack
- **Angular 17+** with standalone components
- **Fuse v21** design system
- **TailwindCSS** for styling
- **Transloco** for internationalization
- **Angular Material** for UI components
- **RxJS** for reactive state management

### Module Structure

```
src/app/modules/onboarding/
├── models/
│   └── onboarding.types.ts          # TypeScript interfaces and types
├── services/
│   ├── onboarding-draft.service.ts  # localStorage persistence
│   └── avatar.service.ts            # Image validation and preview helpers
├── steps/
│   ├── profile-step.component.ts/html       # Step 1: Profile
│   ├── contract-step.component.ts/html      # Step 2: Contract & Notifications
│   ├── consents-step.component.ts/html      # Step 3: Legal Consents
│   └── summary-step.component.ts/html       # Step 4: Summary & Submit
├── onboarding-shell.component.ts/html       # Main wizard wrapper
└── onboarding.routes.ts                      # Routing configuration
```

## User Flow

### 1. First Login Detection

When a user signs in, the backend returns a `mustOnboard` flag in the `/api/auth/me` response:

```typescript
{
  user: {
    id: string;
    email: string;
    firstname?: string;
    // ... other fields
    privacyConsentAt?: string | null;  // Key field for onboarding status
  },
  mustOnboard: boolean  // true if privacyConsentAt is null
}
```

### 2. Routing & Guard Logic

The `OnboardingGuard` enforces the onboarding flow:

**If `mustOnboard === true`:**
- User is redirected to `/onboarding` from any route
- User cannot access dashboard or other protected routes

**If `mustOnboard === false`:**
- User accessing `/onboarding` is redirected to home
- User can access all protected routes normally

### 3. Multi-Step Wizard

#### Step 1: Profile Information
**Required Fields:**
- First name (min 2 characters)
- Last name (min 2 characters)

**Optional Fields:**
- Phone number (pattern validated)
- Date of birth (between 1900-01-01 and today)
- FFT license number
- Profile picture (avatar, max 2MB, PNG/JPEG)
- Cover image (background, max 4MB, PNG/JPEG)

**Features:**
- Real-time form validation
- Image preview before upload
- File size and type validation
- Readonly email display (from session)

#### Step 2: Contract & Notification Preferences
**Required Fields:**
- Training formula (MORNING | AFTERNOON | FULL)

**Notification Toggles:**
- Email notifications (default: true)
- SMS notifications (default: false)
- WhatsApp notifications (default: false)

**Smart Features:**
- Warning shown if SMS enabled but no phone number provided
- Visual toggle switches with Material Design

#### Step 3: Legal Consents (RGPD)
**Required:**
- Privacy Policy and Terms of Use acceptance

**Optional:**
- Photo usage consent for academy communications
- Marketing communications consent

**Features:**
- Link to privacy policy (opens in new tab)
- Clear visual indication of required vs optional consents

#### Step 4: Summary & Submit
**Display:**
- Complete review of all entered information
- Organized by sections (Profile, Contract, Consents)
- Visual checkmarks for accepted consents

**Actions:**
- Back button (returns to previous step)
- Finish button (submits all data)

### 4. Submission Pipeline

When user clicks "Finish", the following sequence executes:

1. **Update User Profile** - `PUT /api/users/me`
   ```typescript
   {
     firstname, lastname, phone, birthDate,
     fftLicenseNumber, formula,
     notifyEmail, notifySMS, notifyWhatsApp
   }
   ```

2. **Upload Avatar** (if provided) - `POST /api/users/me/avatar`
   - Multipart form data
   - Returns avatar URL or inline preview

3. **Upload Background** (if provided) - `POST /api/users/me/background`
   - Multipart form data
   - Returns background URL

4. **Update Consents** - `PUT /api/users/me/consents`
   ```typescript
   {
     privacyConsent: boolean,
     photoConsent: boolean,
     marketingConsent: boolean
   }
   ```
   Backend sets `*_ConsentAt` timestamps when `true`

5. **Refetch User Data** - `GET /api/auth/me`
   - Updates `mustOnboard` flag to `false`
   - Refreshes user session

6. **Clean Up & Redirect**
   - Clear localStorage draft
   - Show success message
   - Redirect to dashboard

## State Management

### Draft Persistence

The `OnboardingDraftService` manages auto-save functionality:

**Storage Key:** `onboarding:v1`

**Stored Data:**
```typescript
{
  profile: {
    firstname, lastname, phone, birthDate, fftLicenseNumber
    // Note: File objects NOT stored (can't be serialized)
  },
  contract: {
    formula, notifyEmail, notifySMS, notifyWhatsApp
  },
  consents: {
    acceptPrivacy, acceptPhoto, acceptMarketing
  }
}
```

**Behavior:**
- Auto-saves on every form change
- Persists across page reloads
- Merges with server data on initialization
- Cleared on successful submission

### Component State

**Shell Component:**
- Manages overall wizard state (current step, forms)
- Stores File objects separately (can't be serialized)
- Coordinates between steps
- Handles submission logic

**Step Components:**
- Emit form state changes to parent
- Validate independently
- Handle their own UI state

## Validation

### Client-Side Validation

**Profile Step:**
- Firstname/Lastname: required, minLength(2)
- Phone: optional, pattern(/^\+?[0-9\s.-]{7,15}$/)
- BirthDate: optional, min(1900-01-01), max(today)
- Images: type (png/jpg/jpeg), size (2MB/4MB)

**Contract Step:**
- Formula: required

**Consents Step:**
- Privacy: requiredTrue

### Server-Side Validation

Backend should validate:
- FFT license number uniqueness (if provided)
- Email format and uniqueness
- Date ranges and formats
- Image file integrity

## Internationalization

### Translation Files

All UI strings are externalized to:
- `/public/i18n/en.json` - English translations
- `/public/i18n/fr.json` - French translations

**Namespace:** `ONBOARDING`

**Key Structure:**
```json
{
  "ONBOARDING": {
    "TITLE": "Complete your profile",
    "STEPS": { ... },
    "ACTIONS": { ... },
    "PROFILE": { ... },
    "CONTRACT": { ... },
    "CONSENTS": { ... },
    "SUMMARY": { ... },
    "SUCCESS": "...",
    "ERROR": "..."
  }
}
```

### Usage in Templates

```html
<h2>{{ 'ONBOARDING.STEPS.PROFILE' | transloco }}</h2>
<mat-error>{{ 'ONBOARDING.PROFILE.FIRSTNAME_REQUIRED' | transloco }}</mat-error>
```

## Accessibility

### ARIA Attributes

All form inputs include:
```html
<input [attr.aria-label]="'ONBOARDING.PROFILE.FIRSTNAME' | transloco"
       [attr.aria-required]="true" />
```

### Keyboard Navigation

- Tab order follows logical flow
- Enter key submits forms
- Escape can cancel (future enhancement)
- Focus indicators visible

### Screen Reader Support

- Step progress announced
- Form errors read aloud
- Button states communicated

## Responsive Design

### Mobile-First Approach

**Breakpoints:**
- Mobile: Single column layout
- Tablet (md+): Two-column grid for form fields
- Desktop: Max width container (4xl)

**Key Features:**
- Touch-friendly button sizes
- Adequate spacing (gap-6, p-6)
- Readable font sizes
- Scrollable content areas

### Layout Structure

```
┌─────────────────────────────────┐
│ Header (sticky)                 │
│ - Title                         │
│ - Progress bar                  │
│ - Step indicators               │
├─────────────────────────────────┤
│ Content (scrollable)            │
│ - Current step component        │
│ - Forms and inputs              │
├─────────────────────────────────┤
│ Footer (sticky)                 │
│ - Back button                   │
│ - Next/Finish button            │
└─────────────────────────────────┘
```

## Error Handling

### User-Facing Errors

**Image Upload Errors:**
```typescript
alert('Only PNG and JPEG images are allowed')
alert('File size must not exceed 2MB')
```

**API Errors:**
```typescript
this.snackBar.open('Something went wrong. Please try again.', '', {
  duration: 5000,
  panelClass: ['error-snackbar']
});
```

### Developer Logging

```typescript
console.error('Onboarding submission failed:', error);
console.error('Failed to save onboarding draft:', error);
```

## Testing Considerations

### Unit Testing (Future)

**Services:**
- `OnboardingDraftService`: save, load, clear operations
- `AvatarService`: file validation, data URL conversion

**Components:**
- Step components: form validation, emit events
- Shell component: step navigation, submission flow

**Guards:**
- `OnboardingGuard`: redirect logic based on mustOnboard

### Integration Testing (Future)

**User Flows:**
1. Complete full onboarding successfully
2. Navigate back through steps
3. Reload page mid-flow (draft persistence)
4. Submit with missing required fields
5. Upload invalid image files
6. Handle API errors gracefully

## Backend API Requirements

### Endpoints

#### GET /api/auth/me
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "privacyConsentAt": "2025-01-15T10:30:00Z",
    // ... other fields
  },
  "mustOnboard": false
}
```

#### PUT /api/users/me
**Request:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+33612345678",
  "birthDate": "1995-06-15",
  "fftLicenseNumber": "FFT12345",
  "formula": "FULL",
  "notifyEmail": true,
  "notifySMS": false,
  "notifyWhatsApp": false
}
```

#### PUT /api/users/me/consents
**Request:**
```json
{
  "privacyConsent": true,
  "photoConsent": true,
  "marketingConsent": false
}
```
Backend should set `privacyConsentAt`, `photoConsentAt`, `marketingConsentAt` timestamps.

#### POST /api/users/me/avatar
**Request:** `multipart/form-data` with file field `avatar`
**Response:**
```json
{
  "ok": true,
  "avatarUrl": "https://..."
}
```

#### POST /api/users/me/background
**Request:** `multipart/form-data` with file field `background`
**Response:**
```json
{
  "ok": true,
  "backgroundUrl": "https://..."
}
```

## Security Considerations

### Data Handling

- **Passwords:** Never included in frontend models
- **Tokens:** Managed by `AuthService`, not exposed in onboarding
- **File Uploads:** Validated client-side, re-validated server-side
- **RGPD Compliance:** Explicit consent required for data processing

### XSS Prevention

- All user input sanitized by Angular
- File uploads validated for type and size
- No innerHTML usage for user-generated content

## Performance

### Bundle Size

- **Lazy Loading:** Onboarding module loaded on-demand (131 kB)
- **Tree Shaking:** Unused Material components excluded
- **Code Splitting:** Each step could be further split if needed

### Optimization

- **Form Validation:** Debounced for performance
- **Draft Saving:** Throttled to avoid excessive localStorage writes
- **Image Preview:** Efficient data URL conversion
- **RxJS Operators:** takeUntil pattern prevents memory leaks

## Future Enhancements

### Nice-to-Have Features

1. **Async Validator** for FFT license number uniqueness
2. **Image Cropping** for avatar (square crop before upload)
3. **Save & Exit** button (partial state persistence on server)
4. **Email Verification** step
5. **Progressive Profile** completion (skip non-critical fields)
6. **Onboarding Analytics** (track drop-off rates per step)

### Accessibility Improvements

1. **Live Regions** for dynamic content updates
2. **Focus Management** (auto-focus first error)
3. **High Contrast Mode** support
4. **Reduced Motion** respects user preferences

## Troubleshooting

### Common Issues

**Issue:** User stuck in onboarding loop
- **Cause:** Backend not setting `privacyConsentAt` timestamp
- **Solution:** Verify consent endpoint sets timestamp correctly

**Issue:** Draft not persisting
- **Cause:** localStorage disabled or full
- **Solution:** Check browser settings, clear old drafts

**Issue:** Images not uploading
- **Cause:** File size exceeded or wrong MIME type
- **Solution:** Validate file before selection, show clear error

**Issue:** Guard not redirecting
- **Cause:** `getMe()` not called or stale data
- **Solution:** Ensure guard fetches fresh user data

## Conclusion

This onboarding flow implementation provides a complete, production-ready solution for first-time user setup. It follows Angular best practices, ensures accessibility, supports internationalization, and provides a smooth user experience across all devices.

The modular architecture makes it easy to extend with additional steps or modify existing ones. The guard-based approach ensures users cannot bypass the onboarding process while maintaining good UX for returning users.

## Support

For questions or issues, please refer to:
- Angular Documentation: https://angular.io/docs
- Material Design: https://material.angular.io
- Transloco: https://ngneat.github.io/transloco
