# Profile Management Feature Implementation

## Overview
This implementation adds a user profile management page that allows authenticated users to view and update their profile information.

## Changes Made

### 1. New Profile Component
- **Location**: `src/app/modules/user/profile/`
- **Files**:
  - `profile.component.ts` - Component logic
  - `profile.component.html` - Template
  - `profile.routes.ts` - Route configuration

### 2. Features
The profile page allows users to:
- Update first name and last name (required)
- Update email (read-only, for display only)
- Update phone number (optional, with validation)
- Update birth date (optional)
- Update FFT license number (optional)
- Upload/change avatar (max 2MB, PNG/JPEG)
- Upload/change background image (max 4MB, PNG/JPEG)

### 3. Navigation Integration
- Added "Profil" menu item to user navigation
- Route: `/user/profile`
- Icon: heroicons_outline:user

### 4. Translations
Added French translations under the `PROFILE` key in `public/i18n/fr.json`:
- Page title
- Form field labels
- Validation messages
- Action buttons

### 5. Reused Services
The implementation leverages existing services:
- `UserService.updateMe()` - Update user profile data
- `UserService.uploadAvatar()` - Upload avatar image
- `UserService.uploadBackground()` - Upload background image
- `AvatarService` - Image validation and preview

### 6. Form Validation
- First name: Required, minimum 2 characters
- Last name: Required, minimum 2 characters
- Phone: Optional, pattern validation for phone numbers
- Email: Read-only (cannot be changed)
- Images: File type and size validation

## Testing Notes
The profile page requires authentication. To test:
1. Sign in with valid credentials
2. Navigate to "Profil" in the user menu
3. Update profile information
4. Upload avatar/background images
5. Click "Enregistrer les modifications" to save

## Technical Details

### Component Structure
The profile component follows Angular best practices:
- Standalone component (no module required)
- Reactive forms for data management
- RxJS for async operations
- Material Design components for UI

### API Integration
The component uses these API endpoints:
- `PUT /users/me` - Update user profile
- `POST /users/me/avatar` - Upload avatar
- `POST /users/me/background` - Upload background

### UI/UX
- Responsive layout (mobile and desktop)
- Material Design form fields
- Image preview before upload
- Loading state during save
- User feedback via alerts (can be enhanced with snackbars)
