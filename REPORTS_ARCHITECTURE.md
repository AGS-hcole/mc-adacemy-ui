# Reports Dashboard - Architecture Overview

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ReportsDashboardComponent                     │
│                        (Container/Smart)                         │
│  - Orchestrates all child components                            │
│  - Manages routing and navigation                               │
│  - Subscribes to state service                                  │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    │ manages state via
                    ▼
    ┌───────────────────────────────────────────────────┐
    │         ReportsStateService (Singleton)           │
    │  - Filter state management (BehaviorSubject)      │
    │  - localStorage persistence                       │
    │  - Query parameter sync                           │
    │  - Debounced API calls (300ms)                    │
    │  - Request cancellation                           │
    └────────┬──────────────────────────────────────────┘
             │
             │ uses
             ▼
    ┌───────────────────────────────────────────────────┐
    │         ReportsApiService (Singleton)             │
    │  - getSummary() → SessionsSummaryDto              │
    │  - getTimeseries() → SessionsTimeseriesDto        │
    │  - getSessionsList() → SessionsListDto            │
    │  - lookupUsers() → UsersLookupDto                 │
    └───────────────────────────────────────────────────┘
```

## Component Hierarchy

```
ReportsDashboardComponent (Smart Component)
│
├── ReportsFiltersComponent (Presentation)
│   ├── Period selector (mat-select)
│   ├── Date range pickers (mat-datepicker)
│   ├── User selector (mat-select)
│   ├── Contract scope selector (mat-select)
│   └── Apply/Reset buttons
│
├── ReportsKpiCardsComponent (Presentation)
│   ├── Total sessions card
│   ├── Under contract card
│   ├── Off contract card
│   └── Unique users card
│
├── ReportsTimeseriesChartComponent (Presentation)
│   └── ApexCharts area/line chart
│
├── ReportsContractShareChartComponent (Presentation)
│   └── ApexCharts donut chart
│
└── ReportsTableComponent (Presentation)
    ├── Material table
    ├── Material paginator
    └── Action buttons (view session)
```

## Data Flow

```
┌──────────────┐
│  User Action │
│  (Filter)    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ReportsFiltersComponent              │
│ - Emits filtersChange event          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ReportsDashboardComponent            │
│ - Calls updateFilters()              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ReportsStateService                  │
│ - Updates BehaviorSubject            │
│ - Persists to localStorage           │
│ - Updates query params               │
│ - Debounces (300ms)                  │
│ - Calls loadData()                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ReportsApiService                    │
│ - Calls backend APIs in parallel:   │
│   * getSummary()                     │
│   * getTimeseries()                  │
│   * getSessionsList()                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend API                          │
│ /api/v1/reports/sessions/*           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ReportsStateService                  │
│ - Updates data BehaviorSubjects:     │
│   * summary$                         │
│   * timeseries$                      │
│   * sessionsList$                    │
│   * loading$                         │
│   * error$                           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ReportsDashboardComponent            │
│ - Subscribes to observables          │
│ - Passes data to child components    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Presentation Components              │
│ - Display data                       │
│ - Show loading/error states          │
│ - Render charts and tables           │
└──────────────────────────────────────┘
```

## State Management Strategy

### Filter State Persistence

```
┌─────────────────────────────────────────────────────────┐
│              Filter State Synchronization               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   Memory     │◄──►│ localStorage │◄──►│   URL    │ │
│  │ (RxJS State) │    │  (Persist)   │    │ (Params) │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│         ▲                                              │
│         │                                              │
│         ▼                                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Filter Changes                                   │ │
│  │  - Debounced (300ms)                              │ │
│  │  - Distinct until changed                         │ │
│  │  - Auto-triggers API calls                        │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Observable Flow

```
filters$ (BehaviorSubject)
   │
   ├──► debounceTime(300)
   │
   ├──► distinctUntilChanged()
   │
   ├──► persist to localStorage
   │
   ├──► update query params
   │
   └──► trigger loadData()
           │
           ├──► cancel previous requests
           │
           └──► combineLatest([
                   getSummary(),
                   getTimeseries(),
                   getSessionsList()
                ])
                   │
                   ├──► loading$ = true
                   │
                   └──► on complete:
                        ├──► summary$ = data
                        ├──► timeseries$ = data
                        ├──► sessionsList$ = data
                        └──► loading$ = false
```

## Service Responsibilities

### ReportsStateService
- **State**: Manages all filter and data state
- **Persistence**: Saves to localStorage on change
- **Routing**: Syncs with URL query parameters
- **API Orchestration**: Coordinates API calls
- **Request Management**: Cancels in-flight requests
- **Error Handling**: Manages error state

### ReportsApiService
- **HTTP Client**: Makes HTTP requests to backend
- **Parameter Building**: Constructs query parameters
- **Type Safety**: Returns typed observables
- **Single Responsibility**: Only handles API communication

### ReportsExportService
- **CSV Export**: Converts data to CSV format
- **JSON Export**: Converts data to JSON format
- **Date Formatting**: Formats dates for export (fr-FR)
- **File Download**: Triggers browser download

## Component Communication Pattern

```
┌────────────────────────────────────────────────────┐
│  Smart Component Pattern (Container/Presentational)│
├────────────────────────────────────────────────────┤
│                                                    │
│  ReportsDashboardComponent (Smart)                 │
│  ├── Has dependencies (services)                   │
│  ├── Manages state subscriptions                   │
│  ├── Handles business logic                        │
│  └── Passes data down via @Input                   │
│      Receives events via @Output                   │
│                                                    │
│  Child Components (Presentational)                 │
│  ├── No service dependencies                       │
│  ├── Pure display logic                            │
│  ├── Receive data via @Input                       │
│  └── Emit events via @Output                       │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Technology Stack Integration

```
┌───────────────────────────────────────────────────────┐
│                   Angular 19                          │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Standalone Components                          │ │
│  │  - No NgModules                                 │ │
│  │  - Direct imports in component metadata        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Reactive Forms                                 │ │
│  │  - FormBuilder for filter form                 │ │
│  │  - No [(ngModel)] usage                        │ │
│  │  - Reactive validation                         │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  RxJS                                           │ │
│  │  - BehaviorSubject for state                   │ │
│  │  - combineLatest for parallel API calls        │ │
│  │  - debounceTime, distinctUntilChanged          │ │
│  │  - takeUntil for cleanup                       │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│              Material Design + Fuse v21               │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Components: mat-select, mat-datepicker,       │ │
│  │  mat-table, mat-paginator, mat-button, etc.    │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Fuse Layout: Sticky header, card layouts,     │ │
│  │  consistent spacing, theme colors              │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                  TailwindCSS                          │
│  - Responsive grid: grid-cols-1 md:grid-cols-2       │
│  - Utility classes: flex, gap, rounded, shadow       │
│  - Color system: bg-card, text-secondary, etc.       │
│  - Custom Fuse theme colors                          │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                   ApexCharts                          │
│  - ng-apexcharts wrapper                             │
│  - Area/line chart for timeseries                    │
│  - Donut chart for distribution                      │
│  - Responsive and interactive                        │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│         Luxon (Date/Time) + Transloco (i18n)         │
│  - DateTime.fromISO() for parsing                    │
│  - setZone('Europe/Paris') for timezone              │
│  - toLocaleString() for fr-FR formatting             │
│  - {{ key | transloco }} for translations            │
└───────────────────────────────────────────────────────┘
```

## Performance Optimizations

1. **Lazy Loading**: Reports module loaded only when accessed
2. **Debounced Filtering**: 300ms delay reduces API calls
3. **Request Cancellation**: Cancels previous requests on new filter
4. **OnPush Change Detection**: Components use OnPush strategy (ready to add)
5. **Parallel API Calls**: combineLatest fetches all data simultaneously
6. **Virtual Scrolling Ready**: Table supports pagination (can add virtual scroll)

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────┐
│              Error Handling Flow                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  API Call                                           │
│     │                                               │
│     ├──► Success                                    │
│     │      └──► Update data BehaviorSubjects        │
│     │                                               │
│     └──► Error                                      │
│            ├──► Log to console                      │
│            ├──► Update error$ BehaviorSubject       │
│            └──► Display error banner with retry    │
│                                                     │
│  Components display:                                │
│  - Loading skeleton (loading$ = true)               │
│  - Error banner (error$ = message)                  │
│  - Empty state (data exists but empty array)        │
│  - Content (data exists with items)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## File Size Summary

- **Total TypeScript/HTML files**: 17
- **Total lines of code**: ~1,677
- **Lazy-loaded bundle size**: ~292 KB
- **ApexCharts bundle** (shared): ~825 KB

## Routing Configuration

```typescript
/admin (AuthGuard required)
  └── /reports (Lazy-loaded module)
       └── /dashboard (ReportsDashboardComponent)
            Query params:
            - from: ISO date
            - to: ISO date
            - userId: string (optional)
            - contractScope: 'all' | 'under' | 'off'
            - preset: 'last7' | 'last30' | 'thisMonth' | 'prevMonth' | 'custom'
            - page: number
            - pageSize: number
            - sort: string (e.g., 'date:desc')
```

## Browser Support

Compatible with all modern browsers supported by Angular 19:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility Features

- Semantic HTML structure
- ARIA labels via Material components
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Color contrast compliance (via Fuse theme)
