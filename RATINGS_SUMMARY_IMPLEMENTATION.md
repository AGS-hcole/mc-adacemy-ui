# Ratings Summary Feature - Implementation Guide

## Overview

This document describes the ratings summary feature implementation for the Reports page, including the new API endpoint requirements for the backend team.

## Backend Requirements

### New API Endpoint

**Endpoint:** `GET /api/reports/ratings/summary`

**Query Parameters:**
- `from` (required): Start date in ISO format (e.g., "2025-01-01")
- `to` (required): End date in ISO format (e.g., "2025-01-31")
- `userId` (optional): Filter by specific user ID
- `contractScope` (optional): Filter by contract scope ("under" | "off" | omit for all)

**Response Type:** `RatingsSummaryDto`

```typescript
interface RatingsSummaryDto {
    period: {
        from: string;
        to: string;
        timezone: string;
    };
    global: {
        average: number;           // Overall average rating (0-10)
        count: number;             // Total number of ratings
        ratedSessions: number;     // Number of sessions with ratings
        unratedSessions: number;   // Number of sessions without ratings
        distribution: number[];    // Array of 11 elements (0-10), count per score
    };
    byContract: {
        withContract: number;      // Count of ratings for contract sessions
        withoutContract: number;   // Count of ratings for non-contract sessions
    };
    perUser: UserRatingStats[];    // All users with their rating stats
    topUsers: UserRatingStats[];   // Top 5 users by average rating
    bottomUsers: UserRatingStats[]; // Bottom 5 users by average rating
}

interface UserRatingStats {
    userId: string;
    userName: string;
    userAvatar?: string;           // Optional avatar URL
    average: number;               // User's average rating (0-10)
    count: number;                 // Number of ratings for this user
}
```

**Example Request:**
```http
GET /api/reports/ratings/summary?from=2025-01-01&to=2025-01-31&userId=user-123&contractScope=under
```

**Example Response:**
```json
{
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31",
    "timezone": "Europe/Paris"
  },
  "global": {
    "average": 7.4,
    "count": 50,
    "ratedSessions": 20,
    "unratedSessions": 5,
    "distribution": [0, 2, 1, 3, 5, 8, 10, 12, 5, 3, 1]
  },
  "byContract": {
    "withContract": 35,
    "withoutContract": 15
  },
  "perUser": [
    {
      "userId": "user-1",
      "userName": "John Doe",
      "average": 8.5,
      "count": 10
    },
    {
      "userId": "user-2",
      "userName": "Jane Smith",
      "average": 7.2,
      "count": 8
    }
  ],
  "topUsers": [
    {
      "userId": "user-1",
      "userName": "John Doe",
      "average": 8.5,
      "count": 10
    }
  ],
  "bottomUsers": [
    {
      "userId": "user-3",
      "userName": "Bob Johnson",
      "average": 6.1,
      "count": 5
    }
  ]
}
```

### Backend Implementation Notes

1. **Query the ratings table** joined with sessions and users
2. **Apply filters:**
   - Date range: `session.date >= from AND session.date <= to`
   - User filter: `rating.userId = userId` (if provided)
   - Contract scope: `session.contractType = contractScope` (if provided and not "all")

3. **Calculate aggregations:**
   - `global.average`: AVG(rating.score) across all ratings
   - `global.count`: COUNT(*) of all ratings
   - `global.ratedSessions`: COUNT(DISTINCT session.id) where rating exists
   - `global.unratedSessions`: COUNT(DISTINCT session.id) where rating is null
   - `global.distribution`: COUNT(*) GROUP BY rating.score (0-10)

4. **Calculate per-user stats:**
   - AVG(rating.score) and COUNT(*) GROUP BY user.id
   - Sort by average DESC for topUsers (LIMIT 5)
   - Sort by average ASC for bottomUsers (LIMIT 5)

5. **Contract split:**
   - COUNT(*) where session.contractType = 'UNDER'
   - COUNT(*) where session.contractType = 'OFF'

## Frontend Implementation

### Service Layer

**File:** `src/app/core/reports/reports-api.service.ts`

Added method:
```typescript
getRatingsSummary(
    from: string,
    to: string,
    userId?: string,
    contractScope?: string
): Observable<RatingsSummaryDto>
```

**File:** `src/app/core/reports/reports-state.service.ts`

Extended to include:
- `ratingsSummary$: Observable<RatingsSummaryDto | null>`
- Fetches ratings summary alongside existing reports data

### UI Components

**File:** `src/app/modules/admin/reports/dashboard/reports-ratings-section.component.ts`

New component with:
- **ChangeDetectionStrategy.OnPush** for performance
- Pure functions for chart data transformation
- Responsive design with Tailwind grid system

**Features:**
1. **KPI Cards** (4 cards in responsive grid)
   - Average Rating (e.g., 7.4 / 10)
   - Total Ratings count
   - Rated Sessions count
   - Unrated Sessions count

2. **Distribution Chart** (Horizontal Bar Chart)
   - ApexCharts horizontal bar chart
   - Shows distribution of ratings 1-10
   - Responsive sizing (height adjusts on breakpoints)
   - Mobile: stacked vertically with smaller labels

3. **Per-User Table**
   - Shows all users with their rating statistics
   - Sortable columns (Average, Count)
   - Click headers to toggle sort direction
   - **Special case:** When userId filter is set, shows single user card instead of table

4. **Top/Bottom Users Mini-Lists**
   - Top 5 users with highest average ratings
   - Bottom 5 users with lowest average ratings (hidden on xs screens)
   - Compact display with avatars and badges

5. **Contract vs Non-Contract Pie Chart**
   - Reduced visual footprint (h-32 md:h-40)
   - Legend on right (lg+) or bottom (sm)
   - Shows percentages only

### Responsive Behavior

Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-12`

Component sizing:
- KPI cards: `lg:col-span-3 sm:col-span-1`
- Distribution chart: `lg:col-span-6 sm:col-span-2`
- Per-user table: `lg:col-span-6 sm:col-span-2`
- Top users: `lg:col-span-3 sm:col-span-2`
- Pie chart: `lg:col-span-3 sm:col-span-2`
- Bottom users: `lg:col-span-3 sm:col-span-2 hidden sm:block`

### Accessibility

- Chart containers have `aria-label` attributes
- Screen-reader-only text with `.sr-only` class
- Semantic HTML with proper heading hierarchy
- Keyboard navigation support for sortable table headers

### Internationalization

All text is translatable using Transloco with keys in `REPORTS.RATINGS.*` namespace.

Translation files updated:
- `public/i18n/en.json`
- `public/i18n/fr.json`

## Testing

### Unit Tests

**Service Tests:** `src/app/core/reports/reports-api.service.spec.ts`
- 7 tests for `getRatingsSummary()` method
- Covers all parameter combinations
- Validates HTTP request construction

**Component Tests:** `src/app/modules/admin/reports/dashboard/reports-ratings-section.component.spec.ts`
- 14 tests for component logic
- DTO to chart series mapping
- Sorting behavior
- Filtered user stats
- Empty states and loading

**Total:** 47 tests passing (21 new + 26 existing)

## Acceptance Criteria Status

✅ **Backend API:** Type definitions and service method ready for backend implementation  
✅ **UI Components:** All visual elements implemented with responsive design  
✅ **Filtering:** Integrates with existing date range, userId, and contractScope filters  
✅ **Responsive:** Works on all screen sizes down to 360px  
✅ **Charts:** Distribution bar chart and reduced-footprint pie chart  
✅ **Per-User:** Table with sorting, special card view when filtered  
✅ **Top/Bottom:** Mini-lists with 5 users each  
✅ **Accessibility:** ARIA labels, screen-reader text, semantic HTML  
✅ **i18n:** Complete translation coverage (EN/FR)  
✅ **Testing:** Comprehensive unit test coverage  
✅ **Build:** Production build successful

## Development Notes

### Running the Application

```bash
npm install
npm start
```

The app will expect the backend API at `http://localhost:3000/api`.

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

Build output in `dist/mc-academy-ui/`.

## Future Enhancements

Potential improvements not in current scope:

1. **Real-time Updates:** WebSocket integration for live rating updates
2. **Export:** Download ratings report as CSV/PDF
3. **Trends:** Historical trend analysis with time-series charts
4. **Comments:** Display rating comments in a modal or tooltip
5. **Filters:** Additional filters (rating range, session type, etc.)
6. **Drill-down:** Click on distribution bars to see specific ratings

## Support

For questions or issues:
- Check the implementation files referenced in this document
- Review the unit tests for usage examples
- Consult the existing RATINGS_IMPLEMENTATION.md for session ratings feature context
