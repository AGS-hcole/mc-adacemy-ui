# Ratings Summary Section - Visual Layout Guide

## Desktop Layout (≥1024px)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         RATINGS SECTION                                 │
├──────────────┬──────────────┬──────────────┬──────────────────────────┤
│ ⭐ Average   │ 📊 Total     │ ✅ Rated     │ ❌ Unrated               │
│   7.4 / 10   │     50       │    20        │     5                    │
│ (lg:col-3)   │ (lg:col-3)   │ (lg:col-3)   │ (lg:col-3)               │
├──────────────┴──────────────┴──────────────┴──────────────────────────┤
│                                                                         │
│  Distribution Chart (1-10)          │  📈 Contract vs Non-Contract    │
│  ═══════════════════  (12)          │         Pie Chart               │
│  ════════════  (10)                 │                                 │
│  ══════════  (8)                    │     [  Contract   ]            │
│  ═════════  (5)                     │     [ Non-Contract]            │
│  ... (1-10 horizontal bars)         │                                 │
│                                     │     Percentages only           │
│  (lg:col-6)                         │     (lg:col-3)                 │
├─────────────────────────────────────┴────────────────────────────────┤
│                                     │  🏆 TOP USERS                   │
│  👥 RATINGS BY USER                 │  ┌───────────────────────────┐ │
│  ┌─────────────────────────────┐   │  │ John Doe      8.5 ⭐      │ │
│  │ Name    │ Average │ Count   │   │  │ Jane Smith    8.2 ⭐      │ │
│  ├─────────┼─────────┼─────────┤   │  │ Bob Johnson   8.0 ⭐      │ │
│  │ John    │ 8.5/10  │  10     │   │  └───────────────────────────┘ │
│  │ Jane    │ 7.2/10  │   8     │   │  (lg:col-3)                    │
│  │ Bob     │ 6.1/10  │   5     │   ├────────────────────────────────┤
│  └─────────┴─────────┴─────────┘   │  📉 BOTTOM USERS                │
│  Sortable headers (click to sort)  │  ┌───────────────────────────┐ │
│  (lg:col-6)                         │  │ User1         5.1 ⭐      │ │
│                                     │  │ User2         5.3 ⭐      │ │
│                                     │  └───────────────────────────┘ │
│                                     │  (lg:col-3)                    │
└─────────────────────────────────────┴────────────────────────────────┘
```

## Tablet Layout (640px - 1023px)

```
┌──────────────────────────────────────────────────┐
│              RATINGS SECTION                     │
├─────────────────────┬────────────────────────────┤
│ ⭐ Average          │ 📊 Total                   │
│   7.4 / 10          │     50                     │
├─────────────────────┼────────────────────────────┤
│ ✅ Rated            │ ❌ Unrated                 │
│    20               │     5                      │
├─────────────────────┴────────────────────────────┤
│  Distribution Chart (1-10)                       │
│  ═══════════════════  (12)                       │
│  ════════════  (10)                              │
│  ══════════  (8)                                 │
│  (sm:col-span-2)                                 │
├──────────────────────────────────────────────────┤
│  👥 RATINGS BY USER                              │
│  (Sortable table)                                │
│  (sm:col-span-2)                                 │
├──────────────────────────────────────────────────┤
│  📈 Contract vs Non-Contract (Pie)               │
│  Legend below chart                              │
│  (sm:col-span-2)                                 │
├─────────────────────┬────────────────────────────┤
│ 🏆 TOP USERS        │ 📉 BOTTOM USERS            │
│ (sm:col-span-2)     │ (sm:col-span-2)            │
└─────────────────────┴────────────────────────────┘
```

## Mobile Layout (< 640px)

```
┌────────────────────────────┐
│    RATINGS SECTION         │
├────────────────────────────┤
│ ⭐ Average                 │
│   7.4 / 10                 │
├────────────────────────────┤
│ 📊 Total: 50               │
├────────────────────────────┤
│ ✅ Rated: 20               │
├────────────────────────────┤
│ ❌ Unrated: 5              │
├────────────────────────────┤
│ Distribution Chart         │
│ (Vertical bars, compact)   │
│ Height: 200px              │
├────────────────────────────┤
│ 👥 Ratings by User         │
│ (Sortable table)           │
├────────────────────────────┤
│ 📈 Contract vs Non-        │
│    Contract Pie            │
│    (Legend below)          │
├────────────────────────────┤
│ 🏆 TOP USERS               │
│ (List of 5)                │
└────────────────────────────┘
Note: Bottom users hidden
```

## Special Cases

### When User Filter is Applied

Instead of the full per-user table, a single user card is displayed:

```
┌────────────────────────────────────────┐
│  USER RATING STATISTICS                 │
│  ┌──────────────────────────────────┐  │
│  │  👤 John Doe                      │  │
│  │                                   │  │
│  │  Average: 8.5 / 10                │  │
│  │  Count: 10 ratings                │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Empty State

When no ratings exist in the period:

```
┌────────────────────────────────────────┐
│                                         │
│         ⭐ (large icon)                │
│                                         │
│     No ratings in this period          │
│                                         │
└────────────────────────────────────────┘
```

### Loading State

Skeleton loaders for all components:

```
┌────────────────────────────────────────┐
│ ░░░░░░░░░░  ░░░░░░░░░░  ░░░░░░░░░░   │
│ (animated skeleton placeholders)      │
└────────────────────────────────────────┘
```

## Color Scheme

- **KPI Card Icons:**
  - Average: Yellow/Gold (⭐)
  - Total: Blue (📊)
  - Rated: Green (✅)
  - Unrated: Gray (❌)
  
- **Charts:**
  - Distribution bars: Primary color with gradient
  - Pie chart: Green (contract) + Amber (non-contract)
  
- **User Lists:**
  - Top users: Gold star badges
  - Bottom users: Gray star badges

## Responsive Breakpoints

- **xs:** < 640px (Mobile)
- **sm:** 640px - 1023px (Tablet)
- **md:** 1024px - 1279px (Small desktop)
- **lg:** ≥ 1280px (Large desktop)

## Accessibility Features

1. **Keyboard Navigation:**
   - Tab through sortable table headers
   - Enter/Space to toggle sort
   
2. **Screen Readers:**
   - Chart descriptions with sr-only text
   - Proper ARIA labels on interactive elements
   
3. **Semantic HTML:**
   - Proper heading hierarchy (h2 → h3)
   - Table markup for tabular data
   
4. **Visual Indicators:**
   - Sort direction arrows
   - Hover states on clickable elements
   - Focus outlines

## Implementation Notes

### Grid System
All layout uses Tailwind's grid system:
```css
.container: grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12
```

### Component Classes
Each component uses appropriate column spans:
```css
.kpi-card: lg:col-span-3 sm:col-span-1
.distribution: lg:col-span-6 sm:col-span-2
.per-user: lg:col-span-6 sm:col-span-2
.pie-chart: lg:col-span-3 sm:col-span-2
.top-users: lg:col-span-3 sm:col-span-2
.bottom-users: lg:col-span-3 sm:col-span-2 hidden sm:block
```

### Chart Configuration
- Distribution chart: ApexCharts horizontal bar
- Pie chart: ApexCharts pie with responsive legend
- All charts: Auto-resize on breakpoint changes
