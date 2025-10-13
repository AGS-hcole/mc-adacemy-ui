# Multi-Date Session Creation Feature

## Overview

This feature allows administrators to create multiple training sessions at once by selecting multiple dates. All sessions will share the same parameters (site, slot, time range, notes, and published status).

## User Interface

### Create Mode

When creating a new session (`/admin/sessions/details/new`):

1. **Date Selection**: A date picker allows selecting multiple dates
   - Click on a date in the calendar to add it to the selection
   - Selected dates appear as chips below the date picker
   - Each chip shows the date in a readable format (e.g., "lun. 16 oct. 2025")
   - Click the X button on a chip to remove that date

2. **Shared Parameters**: All other fields are shared across all sessions:
   - Site
   - Slot (AM/PM)
   - Start time and end time
   - Notes
   - Published status

3. **Validation**:
   - At least one date must be selected
   - All other required fields must be filled
   - Time range must be valid (end time after start time)

4. **Creation**:
   - When clicking "Create", one session is created for each selected date
   - All sessions are created in parallel
   - After successful creation, user is redirected to the sessions list

### Edit Mode

When editing an existing session:
- The date picker remains a **single date** selector (backward compatibility)
- All other functionality remains unchanged

## Technical Implementation

### Component Changes

**File**: `src/app/modules/admin/sessions/details/details.component.ts`

- Added `selectedDates: Date[]` array to store multiple dates
- Modified form initialization to remove required validator from date field in create mode
- Updated `saveSession()` to handle multiple date creation using `forkJoin`
- Added helper methods:
  - `addDate()`: Add a date to the selection
  - `removeDate(index)`: Remove a date from the selection
  - `formatDateDisplay(date)`: Format date for display

### Template Changes

**File**: `src/app/modules/admin/sessions/details/details.component.html`

- Conditional rendering based on `editMode` flag
- Create mode: Date picker with chips for multiple selection
- Edit mode: Single date picker (unchanged)

### Translation Keys

**Files**: `public/i18n/fr.json`, `public/i18n/en.json`

New keys added:
- `SESSIONS.ADMIN.FORM.DATE_MULTIPLE`: Label for multi-date picker
- `SESSIONS.ADMIN.FORM.DATE_MULTIPLE_HINT`: Hint text for multi-date picker
- `SESSIONS.ADMIN.FORM.SELECTED_DATES`: Label for selected dates section

## Example Usage

### Scenario: Creating sessions for October 16-19, 2025

1. Navigate to `/admin/sessions/details/new`
2. Select site: "Centre Sportif"
3. Click on October 16 in the date picker → chip appears
4. Click on October 17 in the date picker → chip appears
5. Click on October 18 in the date picker → chip appears
6. Click on October 19 in the date picker → chip appears
7. Select slot: "Matin (AM)"
8. Leave times as default (09:00 - 12:00)
9. Add notes: "Entraînement intensif"
10. Check "Publier cette session"
11. Click "Créer"

**Result**: 4 sessions are created:
- October 16, 2025 - AM - Centre Sportif
- October 17, 2025 - AM - Centre Sportif
- October 18, 2025 - AM - Centre Sportif
- October 19, 2025 - AM - Centre Sportif

All with the same times, notes, and published status.

## API Integration

The feature uses the existing `createSession()` method from `SessionsService`:
- No changes to the API contract
- Multiple parallel requests are made using RxJS `forkJoin`
- All sessions must be created successfully, or an error is shown

## Backward Compatibility

✅ **Fully backward compatible**:
- Edit mode unchanged (single date only)
- No database schema changes required
- No API changes required
- Existing sessions can be edited normally

## Future Enhancements

Potential improvements for future versions:
1. Progress indicator during bulk creation
2. Partial success handling (show which dates succeeded/failed)
3. Duplicate date detection with the backend
4. Date range quick selector (e.g., "Select week")
5. Copy existing session to new dates
