# Reports Dashboard Feature

## Overview

This feature implements a comprehensive reporting dashboard for My Center Academy that provides an at-a-glance view of training activity over a chosen period.

## Features Implemented

### 1. Core Services

#### ReportsApiService (`src/app/core/reports/reports-api.service.ts`)
- `getSummary()` - Fetches session summary with totals
- `getTimeseries()` - Fetches time-series data for charts
- `getSessionsList()` - Fetches paginated session list
- `lookupUsers()` - Fetches users for filtering

#### ReportsStateService (`src/app/core/reports/reports-state.service.ts`)
- Manages filter state with reactive forms
- Persists filters to localStorage (key: `mca-reports-filters-v1`)
- Syncs filters with query parameters
- Handles debounced API calls
- Cancels in-flight requests on filter changes

#### ReportsExportService (`src/app/core/reports/reports-export.service.ts`)
- `exportCsv()` - Exports data as CSV
- `exportJson()` - Exports data as JSON
- Formats dates in fr-FR locale (Europe/Paris timezone)

### 2. Components

#### ReportsDashboardComponent (Container)
- Main page component at `/admin/reports/dashboard`
- Orchestrates all child components
- Handles routing and state management
- **Location**: `src/app/modules/admin/reports/dashboard/reports-dashboard.component.ts`

#### ReportsFiltersComponent
- Sticky filter bar with:
  - Period presets (Last 7 days, Last 30 days, This month, Previous month, Custom)
  - Date range picker (for custom period)
  - User/academician selector (searchable dropdown)
  - Contract scope filter (All, Under contract, Off contract)
  - Apply and Reset buttons
- Uses Reactive Forms (no ngModel)
- **Location**: `src/app/modules/admin/reports/dashboard/reports-filters.component.ts`

#### ReportsKpiCardsComponent
- Grid of 4 KPI cards:
  1. Total sessions
  2. Under-contract sessions
  3. Off-contract sessions
  4. Unique academicians with at least 1 session
- Loading skeletons during data fetch
- **Location**: `src/app/modules/admin/reports/dashboard/reports-kpi-cards.component.ts`

#### ReportsTimeseriesChartComponent
- ApexCharts area/line chart
- Shows sessions over time (daily buckets)
- Three series: Total, Under contract, Off contract
- Dates formatted in fr-FR locale
- **Location**: `src/app/modules/admin/reports/dashboard/reports-timeseries-chart.component.ts`

#### ReportsContractShareChartComponent
- ApexCharts donut chart
- Shows distribution of under vs off contract sessions
- Color-coded: Green (under contract), Amber (off contract)
- **Location**: `src/app/modules/admin/reports/dashboard/reports-contract-share-chart.component.ts`

#### ReportsTableComponent
- Material table with columns:
  - Date (formatted in fr-FR)
  - Session title
  - Coach name
  - Contract type (badge)
  - Attendees count
  - Status (badge with color coding)
  - Actions (view session button)
- Material paginator for server-side pagination
- Loading skeleton
- Empty state with icon
- **Location**: `src/app/modules/admin/reports/dashboard/reports-table.component.ts`

### 3. Data Types

All TypeScript interfaces and types defined in `src/app/core/reports/reports.types.ts`:
- `ReportsFilters` - Filter configuration
- `SessionsSummaryDto` - API response for summary
- `SessionsTimeseriesDto` - API response for time-series
- `SessionsListDto` - API response for paginated list
- `SessionListItem` - Individual session data
- `ContractScope`, `PeriodPreset`, `SessionStatus`, `SessionContractType` - Enums

### 4. Routing

- Route: `/admin/reports/dashboard`
- Lazy-loaded module with standalone components
- Query parameters: `from`, `to`, `userId`, `contractScope`, `preset`, `page`, `pageSize`, `sort`
- Routes file: `src/app/modules/admin/reports/reports.routes.ts`

### 5. Navigation

Added "Reporting" menu item to admin navigation:
- Icon: `heroicons_outline:chart-bar`
- Title: Translatable via `NAVIGATION.ADMIN.REPORTS.TITLE`
- File: `src/app/core/navigation/navigation.data.ts`

### 6. Internationalization (i18n)

All UI strings are in French (fr-FR) via Transloco:
- `REPORTS.TITLE` - "Reporting"
- `REPORTS.FILTERS.*` - Filter labels
- `REPORTS.KPI.*` - KPI card labels
- `REPORTS.CHART.*` - Chart titles
- `REPORTS.TABLE.*` - Table column headers
- `REPORTS.ACTIONS.*` - Action button labels
- `REPORTS.EMPTY.*` - Empty state messages
- `REPORTS.ERROR.*` - Error messages

File: `public/i18n/fr.json`

## Technical Specifications

### Technology Stack
- **Angular 19** with standalone components
- **Fuse v21** layout and UI patterns
- **TailwindCSS** for styling
- **Material Design** components (buttons, forms, table, paginator)
- **ApexCharts** via ng-apexcharts for data visualization
- **Luxon** for date/time handling (Europe/Paris timezone)
- **Transloco** for i18n

### State Management
- Filters stored in localStorage (`mca-reports-filters-v1`)
- Filter state reflected in URL query parameters
- Reactive state management with RxJS BehaviorSubjects
- Debounced filter changes (300ms) to reduce API calls

### API Integration

Expected API endpoints (as per specification):

1. **GET** `/api/v1/reports/sessions/summary`
   - Query params: `from`, `to`, `userId?`, `contractScope?`
   - Returns: Session totals and period info

2. **GET** `/api/v1/reports/sessions/timeseries`
   - Query params: `from`, `to`, `userId?`, `contractScope?`, `bucket=daily`
   - Returns: Daily bucketed session counts

3. **GET** `/api/v1/reports/sessions/list`
   - Query params: `from`, `to`, `userId?`, `contractScope?`, `page`, `pageSize`, `sort`
   - Returns: Paginated session list

4. **GET** `/api/v1/users/lookup`
   - Query params: `role=academician`, `search?`, `page`, `pageSize`
   - Returns: User list for filtering

### Responsive Design
- Mobile-first approach with TailwindCSS
- Grid layouts adapt to screen size:
  - KPI cards: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
  - Charts: Full width on mobile, 2-column grid on desktop
- Table: Horizontal scroll on mobile
- Sticky filter bar remains accessible on scroll

### Error Handling
- Inline error banner with retry button
- Loading states with skeleton UI
- Empty states with helpful icons and messages
- Request cancellation on rapid filter changes

## Usage

### Access the Dashboard
Navigate to `/admin/reports/dashboard` (requires authentication).

### Filter Data
1. Select a period preset or custom date range
2. Optionally select a specific academician
3. Choose contract scope (all, under, or off contract)
4. Click "Apply" to load data
5. Use "Reset" to return to default filters (last 7 days)

### Export Data
- Click "Exporter CSV" to download current table data as CSV
- Click "Exporter JSON" to download current table data as JSON
- Exports respect current filters and sorting

### View Session Details
Click the eye icon in the table actions column to navigate to session details.

### Pagination
Use the paginator at the bottom of the table to navigate through results.

## File Structure

```
src/app/
├── core/
│   └── reports/
│       ├── reports-api.service.ts
│       ├── reports-export.service.ts
│       ├── reports-state.service.ts
│       └── reports.types.ts
└── modules/
    └── admin/
        └── reports/
            ├── dashboard/
            │   ├── reports-dashboard.component.ts
            │   ├── reports-dashboard.component.html
            │   ├── reports-filters.component.ts
            │   ├── reports-filters.component.html
            │   ├── reports-kpi-cards.component.ts
            │   ├── reports-kpi-cards.component.html
            │   ├── reports-timeseries-chart.component.ts
            │   ├── reports-timeseries-chart.component.html
            │   ├── reports-contract-share-chart.component.ts
            │   ├── reports-contract-share-chart.component.html
            │   ├── reports-table.component.ts
            │   └── reports-table.component.html
            └── reports.routes.ts
```

## Build Information

The feature has been successfully built and integrated:
- Total bundle size for reports module: ~292 KB (lazy-loaded)
- ApexCharts bundle: ~825 KB (shared, lazy-loaded)
- No TypeScript compilation errors
- All components follow Angular 19 standalone patterns

## Future Enhancements

Potential improvements (not implemented in this version):
- Virtual scrolling for very large datasets
- Additional chart types (bar chart, stacked area)
- PDF export option
- Advanced filters (date created, location, coach)
- Comparison mode (compare two periods)
- Scheduled report generation
- Email report delivery
- More granular time buckets (hourly, weekly, monthly)

## Testing Considerations

To fully test this feature, you will need:
1. Backend API endpoints implemented as per specification
2. Authentication system active
3. Test data with various sessions (under/off contract, different dates, multiple users)
4. Different user roles to test access control
5. Test localStorage persistence across browser sessions
6. Test URL query parameter handling (bookmarking, sharing)

## Notes

- All code and comments are in English as requested
- All UI strings are in French via Transloco
- Dates are formatted in fr-FR locale with Europe/Paris timezone
- The implementation uses Reactive Forms exclusively (no ngModel)
- State persistence uses localStorage and URL query parameters
- The feature is fully responsive and follows Fuse design patterns
