# Training Sessions Feature

## Overview

This feature provides a complete training sessions management system for MC Academy, with separate interfaces for administrators and users (players).

## Features

### Admin Interface (`/admin/sessions`)

- **Session List**: View all sessions with filtering by site, date range, slot (AM/PM), and published status
- **Create/Edit Sessions**: Form to create or edit sessions with:
  - Site selection
  - Date picker
  - Slot selection (AM/PM)
  - Optional custom start/end times (defaults: AM 09:00-12:00, PM 14:00-17:00)
  - Notes field
  - Published status toggle
- **Session Actions**:
  - Publish/Unpublish sessions
  - Cancel sessions
  - Delete sessions
  - View and manage attendees (future enhancement)

### User Interface (`/user/sessions`)

- **Upcoming Sessions**: View all published, non-cancelled future sessions
- **Session Cards**: Display with:
  - Date and time
  - Site location
  - Slot indicator (Morning/Afternoon)
  - Notes/instructions
  - Capacity information
  - Registration status
- **Registration (RSVP)**:
  - One-click registration for eligible sessions
  - Formula compatibility checking
  - Cutoff enforcement (Friday 18:00 before session)
  - Visual status indicators

## Technical Architecture

### Core Types (`src/app/core/session/`)

- **session.types.ts**: Defines all interfaces and enums
  - `Session`: Main session model
  - `SessionSlot`: AM/PM enum
  - `SessionAttendee`: Attendee/RSVP model
  - `Site`: Training site model
  - Request/Response types

- **session.helpers.ts**: Utility functions
  - `isFormulaCompatibleWithSlot()`: Checks if user's formula allows registration
  - `isCutoffPassed()`: Validates registration deadline
  - `validateTimeRange()`: Ensures start time < end time
  - `getSessionDisplayTime()`: Gets display time with defaults

### Services

- **sessions.service.ts**: CRUD operations for sessions
  - `getSessions(filters?)`: List with optional filters
  - `getUpcomingSessions()`: Published future sessions
  - `getSessionById(id)`: Session details
  - `createSession(request)`: Create new session
  - `updateSession(id, request)`: Update existing session
  - `deleteSession(id)`: Delete session
  - `adminRegisterUser(request)`: Admin override registration
  - `getSites()`: List available sites

- **rsvp.service.ts**: User registration operations
  - `rsvp(sessionId)`: Register user for session
  - `cancelRsvp(sessionId)`: Cancel user's registration
  - `canRegister(session, formula)`: Check eligibility

### Components

#### Admin Module (`src/app/modules/admin/sessions/`)

- **list/**: Session list with filters and actions
- **details/**: Create/edit session form with validations
- **sessions.routes.ts**: Routing configuration

#### User Module (`src/app/modules/user/sessions/`)

- **list/**: Upcoming sessions with registration
- **sessions.routes.ts**: Routing configuration

## Business Rules

### Session Model

1. **Backward Compatibility**: Sessions support both:
   - Auto-generated sessions (slot only) with default times
   - Manual sessions with explicit startTime/endTime

2. **Default Times**:
   - AM slot: 09:00 - 12:00
   - PM slot: 14:00 - 17:00

3. **Validation**:
   - Site must exist
   - Date is required
   - Slot (AM/PM) is required
   - If custom times provided: startTime < endTime
   - No duplicate sessions (same site/date/slot)

### RSVP Rules

1. **Formula Compatibility**:
   - MORNING formula → Can only register for AM slots
   - AFTERNOON formula → Can only register for PM slots
   - FULL formula → Can register for any slot

2. **Registration Cutoff**:
   - Deadline: Friday 18:00 before the session
   - After cutoff: Registration blocked with clear message

3. **Admin Override**:
   - Admins can register users bypassing all restrictions
   - Marked with `createdByAdmin: true`
   - Can register users even if formula doesn't match (marked `outOfContract: true`)

4. **Session Status**:
   - Must be published to be visible to users
   - Cannot register for cancelled sessions
   - Capacity limits enforced if set

## API Endpoints

The feature expects the following REST endpoints:

### Sessions
- `GET /api/sessions` - List sessions (with query params for filters)
- `GET /api/sessions/upcoming` - List upcoming published sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create session (admin only)
- `PUT /api/sessions/:id` - Update session (admin only)
- `DELETE /api/sessions/:id` - Delete session (admin only)

### RSVP
- `POST /api/sessions/:id/rsvp` - User registration
- `DELETE /api/sessions/:id/rsvp` - Cancel user registration
- `POST /api/sessions/:id/admin-register` - Admin override registration

### Sites
- `GET /api/sites` - List available sites

## Translations

All text is internationalized using Transloco. Translation keys are in:
- `public/i18n/fr.json` (French - primary)
- `public/i18n/en.json` (English)

Key namespaces:
- `SESSIONS.SLOT.*` - Slot labels (AM/PM)
- `SESSIONS.STATUS.*` - Status labels
- `SESSIONS.ADMIN.*` - Admin interface
- `SESSIONS.USER.*` - User interface

## Styling

- Uses Fuse v21 design system
- Tailwind CSS for layouts and utilities
- Material Design components
- Responsive design (mobile-first)
- Dark mode support

## Future Enhancements

1. **Attendees Management**:
   - Drawer to view session attendees
   - Admin form to manually add users
   - Remove attendees
   - Export attendee lists

2. **Bulk Operations**:
   - Publish/unpublish multiple sessions
   - Bulk cancellation with reason

3. **Calendar View**:
   - Monthly calendar display
   - Drag-and-drop session creation

4. **Notifications**:
   - Email/SMS reminders before sessions
   - Cutoff deadline alerts
   - Cancellation notifications

5. **Waitlist**:
   - Queue when session is full
   - Auto-promotion when spot opens

6. **Recurring Sessions**:
   - Template-based generation
   - Weekly/monthly patterns

## Testing Locally

Since the backend API might not be available during development:

1. **Mock Data**: Consider adding mock API data using Fuse Mock API service
2. **Error Handling**: Services handle HTTP errors gracefully
3. **Loading States**: Skeleton loaders and empty states are implemented

## Notes

- All form components use Reactive Forms (no ngModel)
- Standalone components architecture (Angular 17+)
- RxJS for state management
- Proper cleanup with `takeUntil()` in components
- Accessibility considerations (aria-labels, focus management)
