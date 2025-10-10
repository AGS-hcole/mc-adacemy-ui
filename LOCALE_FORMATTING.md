# Locale-Aware Date Formatting Implementation

## Overview

This document describes the implementation of locale-aware date and datetime formatting in the mc-academy-ui application. The implementation ensures that dates are displayed in a format consistent with the selected language (French or English).

## Changes Made

### 1. Locale Registration (`app.config.ts`)

- Registered French (`fr`) and English (`en`) locale data using Angular's `registerLocaleData`
- Added `LOCALE_ID` provider that dynamically returns the active language
- Modified app initializer to set the DateAdapter locale on application startup

```typescript
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEn, 'en');
```

### 2. LocaleService (`core/locale/locale.service.ts`)

Created a new service that:
- Subscribes to Transloco language changes
- Updates the Material DateAdapter locale when language changes
- Provides a centralized way to manage locale settings

### 3. LocalizedDatePipe (`shared/pipes/localized-date.pipe.ts`)

Created a custom pipe that:
- Automatically formats dates based on the currently active language
- Uses Angular's DatePipe internally with the correct locale
- Marked as impure to respond to language changes
- Supports all standard Angular date formats (fullDate, shortDate, medium, short, etc.)

Usage:
```html
{{ date | localizedDate: 'fullDate' }}
{{ date | localizedDate: 'shortDate' }}
{{ date | localizedDate: 'short' }}
```

### 4. Language Component Update (`layout/common/languages/languages.component.ts`)

- Injected DateAdapter
- Updated `setActiveLang()` method to also update the DateAdapter locale when language changes

### 5. Template Updates

Updated the following components to use `localizedDate` pipe instead of `date` pipe:

- **Admin Sessions List** (`modules/admin/sessions/list/`)
  - Desktop view: `fullDate` format
  - Tablet view: `shortDate` format
  - Mobile view: `fullDate` format

- **Admin Session View** (`modules/admin/sessions/view/`)
  - Session date: `shortDate` format

- **Admin Users Details** (`modules/admin/users/details/`)
  - Birth date: `shortDate` format
  - Consent timestamps: `short` format (includes date and time)

- **User Sessions List** (`modules/user/sessions/list/`)
  - Date grouping headers: `fullDate` format

## Date Format Examples

### French (fr)
- `fullDate`: "mercredi 15 mars 2024"
- `shortDate`: "15/03/2024"
- `short`: "15/03/2024 14:30"

### English (en)
- `fullDate`: "Wednesday, March 15, 2024"
- `shortDate`: "3/15/24"
- `short`: "3/15/24, 2:30 PM"

## DatePicker Behavior

The Material DatePicker component automatically respects the locale set on the DateAdapter:
- Date format in the input field changes based on language
- Calendar month/year labels are localized
- Day and month names are displayed in the active language

## How to Verify

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Test language switching**:
   - Navigate to any page with dates (e.g., Sessions list, User details)
   - Note the current date format
   - Click the language selector in the top navigation
   - Switch between French and English
   - Observe that all dates update to the new locale format

3. **Test DatePicker**:
   - Navigate to Session creation/edit page
   - Click on the date picker
   - Verify that month/year labels and day names are in the correct language
   - Switch language and verify the picker updates

## Technical Notes

### Why LocalizedDatePipe is "impure"

The pipe is marked with `pure: false` to ensure it re-evaluates when the language changes. Pure pipes only re-evaluate when their input values change, which wouldn't capture language switching.

### DateAdapter Locale Synchronization

The DateAdapter locale is updated in two places:
1. **On application start**: Via the app initializer in `app.config.ts`
2. **On language change**: Via the LocaleService subscription and the LanguagesComponent

This ensures the DatePicker always displays in the correct language.

### Backward Compatibility

The standard Angular `date` pipe is still available for use in cases where time-only formatting is needed (e.g., `HH:mm` format), as these formats are not locale-specific.

## Future Enhancements

Consider the following improvements:
1. Add user preference storage to persist language selection
2. Add locale-specific number formatting for statistics
3. Consider adding locale-specific currency formatting if needed
4. Add automated tests to verify locale switching behavior
