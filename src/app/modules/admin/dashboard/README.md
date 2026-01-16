# Admin Day Dashboard

## Overview

The Admin Day Dashboard is a comprehensive view that replaces the previous admin dashboard at `/admin/dashboard`. It provides admins with a complete operational overview of a specific day, including:

- Training sessions with participants, attendance, and ratings
- Manor stays with occupancy information
- Transport occurrences with booking details

## Architecture

### Components Structure

```
src/app/modules/admin/dashboard/
├── models/
│   └── admin-dashboard.models.ts          # TypeScript interfaces for API data
├── services/
│   └── admin-dashboard.service.ts         # Service with caching and error handling
├── components/
│   ├── dashboard-date-toolbar.component.*  # Date selection controls
│   ├── sessions-day-card.component.*       # Sessions display and rating edit
│   ├── manors-day-card.component.*         # Manor stays display
│   ├── transports-day-card.component.*     # Transport occurrences display
│   └── rating-edit-dialog.component.*      # Dialog for editing ratings
├── admin-dashboard-page.component.*        # Main container component
└── dashboard-legacy.component.*            # Legacy dashboard (deprecated)
```

### API Endpoint

**GET** `/admin/dashboard?date=YYYY-MM-DD`

Returns `AdminDashboardDto` with:
- `sessions`: Array of sessions with participants and ratings
- `manors`: Array of manors with stays
- `transports`: Array of transport occurrences with bookings

### Service Features

**AdminDashboardService** (`admin-dashboard.service.ts`)
- Date-based caching (Map<string, AdminDashboardDto>)
- Loading and error state management
- Refresh capability to force reload
- Automatic date formatting to YYYY-MM-DD

### Key Features

#### 1. Date Selection
- Material Datepicker for calendar selection
- "Today" button for quick navigation
- Previous/Next day navigation buttons
- French locale date formatting (weekday, day month year)

#### 2. Sessions Block
- Grouped by slot (AM/PM) and site
- Participant list with attendance status (YES/NO)
- Out-of-contract badge
- Rating display (score/10) with color coding:
  - Green: 7-10
  - Orange: 4-6
  - Red: 0-3
- Edit button to modify rating and comment
- Canceled session indicator

#### 3. Rating & Comment Editing
- Dialog with score slider (0-10)
- Comment textarea (max 2000 chars)
- Optimistic UI updates
- Error handling with rollback
- Uses existing `RatingsService.upsert()` endpoint
- Success/error snackbar notifications

#### 4. Manor Stays Block
- Only displays manors with active stays
- Capacity tracking with over-capacity warning
- Expand/collapse for long lists (shows 5 by default)
- Status badges (PLANNED/CANCELED)
- Admin-created indicator

#### 5. Transports Block
- Departure time and route display
- Status indicator (SCHEDULED/CANCELLED/COMPLETED)
- Booked seats vs capacity
- Confirmed bookings list
- Seats count per booking

### Layout

- **Desktop (lg+)**: 2-column layout
  - Left (8/12 width): Sessions
  - Right (4/12 width): Manors + Transports stacked
- **Mobile**: Single column, full-width cards
- All blocks have:
  - Loading skeleton
  - Empty state
  - Error state with retry

### Styling

- TailwindCSS utilities
- Angular Material components
- Dark mode support
- Consistent with existing admin sections (`/admin/sessions`)

## Usage

### For Admins

1. Navigate to `/admin/dashboard`
2. Select a date using the datepicker or navigation buttons
3. View all operational data for the selected day
4. Click "Edit" on any participant to update their rating/comment
5. Use "Today" button to quickly return to current day

### For Developers

#### Loading Dashboard Data

```typescript
// Inject the service
constructor(private dashboardService: AdminDashboardService) {}

// Load data for a specific date
this.dashboardService.getDashboard('2026-01-16').subscribe({
  next: (data) => console.log('Dashboard data:', data),
  error: (error) => console.error('Failed to load:', error)
});

// Refresh to force reload
this.dashboardService.refresh('2026-01-16').subscribe();
```

#### Optimistic Updates

When a rating is edited, the UI updates immediately while the API call is in progress. If the call fails, the previous state is restored.

```typescript
// Store original state
const original = JSON.parse(JSON.stringify(this.dashboardData));

// Apply optimistic update
participant.rating = { score: newScore, comment: newComment };

// Make API call
this.ratingsService.upsert(sessionId, userId, { score, comment })
  .subscribe({
    next: (rating) => {
      // Update with server response
      participant.rating = rating;
    },
    error: (error) => {
      // Rollback on failure
      this.dashboardData = original;
    }
  });
```

## Testing

### Build

```bash
npm run build
```

### Unit Tests

To be added based on project testing infrastructure.

## Future Enhancements

Possible improvements:
- Export to PDF/Excel
- Filters (by site, status, etc.)
- Quick actions (cancel session, contact participants)
- Push notifications for changes
- Real-time updates via WebSocket

## Migration Notes

### From Old Dashboard

The old dashboard component has been renamed to `dashboard-legacy.component.ts` for reference but is no longer used in routing. The new dashboard:

- Uses a single API call instead of multiple forkJoin calls
- Provides more detailed operational data
- Supports date navigation
- Allows inline editing of ratings

### Route Configuration

Updated `admin.routes.ts`:
```typescript
{
  path: 'dashboard',
  component: AdminDashboardPageComponent, // New component
}
```

## Related Files

- **Rating Service**: `src/app/core/session/ratings.service.ts`
- **Session Types**: `src/app/core/session/session.types.ts`
- **Manor Models**: `src/app/core/models/residence.models.ts`
- **Transport Types**: `src/app/core/transports/transport.types.ts`

## Dependencies

- Angular Material (Cards, Buttons, Icons, Datepicker, Slider, Dialog, etc.)
- TailwindCSS
- Transloco (i18n)
- RxJS (Observables, Subjects)

## License

Part of My Center Academy application.
