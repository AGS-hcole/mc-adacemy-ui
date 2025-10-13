# Tournaments Feature Implementation

## Overview

This implementation provides a complete tournament management system for MC Academy following all specifications. It includes:

- **Admin Interface**: Full CRUD operations, participant management, team generation, and drag-and-drop team organization
- **User Interface**: Tournament browsing, RSVP functionality, and feedback submission
- **i18n Support**: Complete English and French translations
- **Responsive Design**: Mobile-first approach using Fuse v21 and Tailwind CSS

## Architecture

### Core Services

#### TournamentsService (`src/app/core/tournament/tournaments.service.ts`)

Provides all tournament-related operations:

**Admin Methods:**
- `list(filters?)` - Get tournaments with optional filtering
- `getById(id)` - Get tournament details
- `create(payload)` - Create new tournament
- `update(id, payload)` - Update tournament
- `remove(id)` - Delete tournament
- `publish(id)` - Publish tournament
- `archive(id)` - Archive tournament
- `replaceParticipants(id, userIds)` - Replace participant list
- `generateTeams(id)` - Generate homogeneous pairs
- `reorderTeams(id, teamOrder)` - Reorder teams
- `setTeamPlacement(id, teamId, placement)` - Set team placement

**User Methods:**
- `listMine(scope)` - Get user's tournaments (upcoming/past/all)
- `rsvp(id, status)` - Confirm or decline participation
- `feedback(id, feedback)` - Submit feedback

**Utility Methods:**
- `lookupUsers(roles?)` - Search users for participant selection

### Type Definitions (`src/app/core/tournament/tournament.types.ts`)

Strong typing for all tournament-related data structures:

- `Tournament` - Main tournament model
- `TournamentType` - SINGLES | DOUBLES
- `TournamentStatus` - DRAFT | PUBLISHED | ARCHIVED
- `RsvpStatus` - CONFIRMED | DECLINED
- `Team` - Team model with members
- `TeamMember` - Team member with ranking
- `TournamentParticipant` - Participant with RSVP status
- `Address` - Location information with optional coordinates

## Routes

### Admin Routes (`/admin/tournaments`)

Defined in `src/app/modules/admin/tournaments/tournaments.routes.ts`:

- `/admin/tournaments` - List view (TournamentListComponent)
- `/admin/tournaments/new` - Create new tournament (TournamentEditComponent)
- `/admin/tournaments/:id` - Edit existing tournament (TournamentEditComponent)

### User Routes (`/user/tournaments`)

Defined in `src/app/modules/user/tournaments/tournaments.routes.ts`:

- `/user/tournaments` - List view with tabs (UserTournamentListComponent)
- `/user/tournaments/:id` - Tournament details (UserTournamentDetailsComponent)

## Components

### Admin Components

#### TournamentListComponent
**Location:** `src/app/modules/admin/tournaments/list/`

Features:
- Table view with sortable columns
- Filters: status, type, search
- Actions: create, edit, publish, archive, delete
- Status badges with color coding
- Type badges (Singles/Doubles)

#### TournamentEditComponent
**Location:** `src/app/modules/admin/tournaments/edit/`

Features:
- Reactive form with validation
- Date pickers with Material DatePicker
- Address fields with optional lat/lng
- Participant selector:
  - User lookup with search
  - Multi-select with checkboxes
  - Display current ranking
- Team builder:
  - "Generate Homogeneous Pairs" button
  - Drag & Drop reordering (Angular CDK)
  - Display team members with rankings
  - Set team placements
- Publish validation (min 2 participants, teams generated)

### User Components

#### UserTournamentListComponent
**Location:** `src/app/modules/user/tournaments/list/`

Features:
- Tabs: Upcoming / Past
- Card-based layout
- Displays:
  - Tournament title and type badge
  - Dates with localized formatting
  - Location (city, country)
  - Teammate information
  - RSVP status badge
  - Placement for past tournaments

#### UserTournamentDetailsComponent
**Location:** `src/app/modules/user/tournaments/details/`

Features:
- Tournament header with type badge
- Information section:
  - Dates with full formatting
  - Complete address
- My Team section:
  - User info with ranking
  - Teammate info with ranking
  - Placement badge (if set)
- RSVP section (visible before tournament end):
  - Confirm/Decline buttons
  - Current status display
- Feedback section (visible after tournament end):
  - Textarea for feedback
  - Submit button
- Participants list (read-only)
- Teams list (read-only) with placements

## Drag & Drop Implementation

The team builder uses Angular CDK's drag-drop module:

```typescript
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

dropTeam(event: CdkDragDrop<Team[]>): void {
    moveItemInArray(this.teams, event.previousIndex, event.currentIndex);
    const teamOrder = this.teams.map(t => t.id);
    this._tournamentsService.reorderTeams(this.tournament.id, teamOrder).subscribe();
}
```

The template uses:
```html
<div cdkDropList [cdkDropListData]="teams" (cdkDropListDropped)="dropTeam($event)">
    <div *ngFor="let team of teams" cdkDrag>
        <!-- Team content -->
    </div>
</div>
```

## Form Validation

The tournament form includes comprehensive validation:

```typescript
this.tournamentForm = this._formBuilder.group({
    title: ['', [Validators.required]],
    type: [TournamentType.DOUBLES, [Validators.required]],
    addressLine1: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['', [Validators.required]],
    startsAt: [null, [Validators.required]],
    endsAt: [null, [Validators.required]],
    // Optional fields
    addressLine2: [''],
    latitude: [null],
    longitude: [null],
});
```

Additional validation for publishing:
- Minimum 2 participants
- Teams must be generated
- Status must be DRAFT

## Translations

### Translation Keys Structure

All translations follow the namespace pattern `TOURNAMENTS.*`:

```
TOURNAMENTS
├── TYPE
│   ├── SINGLES
│   └── DOUBLES
├── STATUS
│   ├── DRAFT
│   ├── PUBLISHED
│   └── ARCHIVED
├── RSVP
│   ├── CONFIRM
│   ├── DECLINE
│   ├── CONFIRMED
│   └── DECLINED
├── ADMIN
│   ├── TITLE
│   ├── CREATE
│   ├── EDIT
│   ├── NO_TOURNAMENTS
│   ├── FILTERS.*
│   ├── TABLE.*
│   └── ACTIONS.*
├── USER
│   ├── TITLE
│   ├── UPCOMING
│   ├── PAST
│   ├── INFO
│   ├── MY_TEAM
│   ├── RSVP
│   ├── FEEDBACK
│   ├── PARTICIPANTS
│   └── TEAMS
├── FORMS.*
└── FEEDBACK.*
```

### Supported Languages

- **English** (`public/i18n/en.json`)
- **French** (`public/i18n/fr.json`)

### Navigation Translations

Added to both admin and user navigation:

```json
{
  "NAVIGATION": {
    "ADMIN": {
      "TOURNAMENTS": {
        "TITLE": "Tournaments" // "Tournois" in French
      }
    },
    "USER": {
      "TOURNAMENTS": {
        "TITLE": "My Tournaments" // "Mes tournois" in French
      }
    }
  }
}
```

## API Integration

### Expected Backend Endpoints

**Tournaments:**
- `GET /api/tournaments` - List with filters (query params: status, type, startDate, endDate, search)
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament
- `PATCH /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

**Actions:**
- `POST /api/tournaments/:id/publish` - Publish tournament
- `POST /api/tournaments/:id/archive` - Archive tournament
- `PUT /api/tournaments/:id/participants` - Replace participants (body: { userIds: string[] })
- `POST /api/tournaments/:id/generate-teams` - Generate homogeneous teams
- `POST /api/tournaments/:id/reorder-teams` - Reorder teams (body: { teamOrder: string[] })
- `PATCH /api/tournaments/:id/teams/:teamId/placement` - Set team placement (body: { placement: number | null })

**User Actions:**
- `GET /api/tournaments/mine?scope=upcoming|past|all` - Get user's tournaments
- `POST /api/tournaments/:id/rsvp` - RSVP (body: { status: 'CONFIRMED' | 'DECLINED' })
- `POST /api/tournaments/:id/feedback` - Submit feedback (body: { feedback: string })

**Utilities:**
- `GET /api/users/lookup?roles=` - Lookup users (empty string for all users)

### Request/Response Models

See `tournament.types.ts` for detailed type definitions.

## Styling

The implementation uses:

- **Fuse v21** design system for consistent look and feel
- **Tailwind CSS** for utility classes
- **Material Design** components (buttons, form fields, icons, etc.)
- **Responsive grid** layouts (1 column on mobile, 2-3 columns on larger screens)
- **Color-coded badges** for statuses and types
- **Dark mode** support through Tailwind and Fuse theming

### Color Schemes

**Status Colors:**
- DRAFT: Yellow (bg-yellow-100/text-yellow-800)
- PUBLISHED: Green (bg-green-100/text-green-800)
- ARCHIVED: Gray (bg-gray-100/text-gray-800)

**Type Colors:**
- SINGLES: Blue (bg-blue-100/text-blue-800)
- DOUBLES: Purple (bg-purple-100/text-purple-800)

**RSVP Colors:**
- CONFIRMED: Green
- DECLINED: Red

## State Management

The service uses RxJS BehaviorSubjects for state management:

```typescript
private _tournament: BehaviorSubject<Tournament | null> = new BehaviorSubject(null);
private _tournaments: BehaviorSubject<Tournament[] | null> = new BehaviorSubject(null);

get tournament$(): Observable<Tournament> {
    return this._tournament.asObservable();
}

get tournaments$(): Observable<Tournament[]> {
    return this._tournaments.asObservable();
}
```

Components subscribe to these observables and use `takeUntil` for proper cleanup:

```typescript
private _unsubscribeAll: Subject<void> = new Subject<void>();

ngOnInit(): void {
    this._tournamentsService.tournaments$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(tournaments => {
            this.tournaments = tournaments;
            this._changeDetectorRef.markForCheck();
        });
}

ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
}
```

## Navigation Integration

Tournament links are integrated into the application navigation:

**Admin Navigation:**
```typescript
{
    id: 'tournaments',
    title: 'NAVIGATION.ADMIN.TOURNAMENTS.TITLE',
    type: 'basic',
    icon: 'heroicons_outline:trophy',
    link: '/admin/tournaments',
}
```

**User Navigation:**
```typescript
{
    id: 'tournaments',
    title: 'NAVIGATION.USER.TOURNAMENTS.TITLE',
    type: 'basic',
    icon: 'heroicons_outline:trophy',
    link: '/user/tournaments',
}
```

## Files Created

### Core
- `src/app/core/tournament/tournament.types.ts` - Type definitions
- `src/app/core/tournament/tournaments.service.ts` - Service implementation

### Admin Components
- `src/app/modules/admin/tournaments/tournaments.routes.ts` - Admin routes
- `src/app/modules/admin/tournaments/list/list.component.ts` - List logic
- `src/app/modules/admin/tournaments/list/list.component.html` - List template
- `src/app/modules/admin/tournaments/edit/edit.component.ts` - Edit logic
- `src/app/modules/admin/tournaments/edit/edit.component.html` - Edit template

### User Components
- `src/app/modules/user/tournaments/tournaments.routes.ts` - User routes
- `src/app/modules/user/tournaments/list/list.component.ts` - List logic
- `src/app/modules/user/tournaments/list/list.component.html` - List template
- `src/app/modules/user/tournaments/details/details.component.ts` - Details logic
- `src/app/modules/user/tournaments/details/details.component.html` - Details template

### Modified Files
- `src/app/modules/admin/admin.routes.ts` - Added tournaments route
- `src/app/modules/user/user.routes.ts` - Added tournaments route
- `src/app/core/navigation/navigation.data.ts` - Enabled tournament navigation
- `public/i18n/en.json` - Added English translations
- `public/i18n/fr.json` - Added French translations
- `angular.json` - Disabled font inlining for build

## Testing Considerations

When testing locally without a backend:

1. **Mock API**: Consider using Fuse Mock API service for development
2. **Error Handling**: Services handle HTTP errors gracefully
3. **Loading States**: Components show empty states when no data
4. **Form Validation**: All required fields are validated client-side

## Business Rules

### Tournament Creation
- Title, type, dates, and address (line1, postal code, city, country) are required
- Starts at must be before ends at
- Status defaults to DRAFT on creation
- Participants and teams are optional on creation

### Publishing
- Requires at least 2 participants
- Requires teams to be generated
- Only DRAFT tournaments can be published

### Team Generation
- Generates homogeneous pairs based on participant rankings
- For doubles: creates teams of 2 members
- Handles odd numbers (allows teams of 1)
- Adjacent participants by ranking are paired together

### RSVP
- Only available for PUBLISHED tournaments
- Only available before tournament end date
- Users can change their RSVP status

### Feedback
- Only available after tournament end date
- Users can update their feedback
- Stored per participant

## Future Enhancements

1. **Advanced Team Management**:
   - Move members between teams (not just reorder)
   - Manual team creation
   - Team naming

2. **Enhanced Participant Management**:
   - Import participants from CSV
   - Bulk operations
   - Participant notes

3. **Tournament Brackets**:
   - Visual bracket display
   - Match scheduling
   - Score tracking

4. **Notifications**:
   - Email reminders
   - RSVP confirmations
   - Result announcements

5. **Statistics**:
   - Player performance tracking
   - Tournament history
   - Ranking evolution

6. **Calendar Integration**:
   - ICS file export
   - Google Calendar sync

## Accessibility

- All interactive elements have appropriate ARIA labels
- Form fields have clear labels and error messages
- Color is not the only indicator of state (text labels included)
- Keyboard navigation supported
- Focus management in drag-and-drop operations

## Performance Considerations

- Lazy-loaded routes reduce initial bundle size
- Change detection strategy: OnPush for better performance
- Proper cleanup with `takeUntil` pattern
- Minimal re-renders through change detection

## Build Information

The implementation compiles successfully with only one warning about CommonJS dependencies (lodash in navigation service, pre-existing).

Build output shows tournaments routes are properly lazy-loaded:
- `chunk-HNRKNGP3.js` - tournaments-routes (81.64 kB raw, 18.92 kB estimated transfer)
- `chunk-XFXLZHUB.js` - tournaments-routes (61.91 kB raw, 13.14 kB estimated transfer)

Total additional bundle size: ~32 kB estimated transfer size for tournament routes.
