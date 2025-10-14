# Tournament Admin Interface - Visual Structure

## Page Structure

### Tournament List Page (`/admin/tournaments`)
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Tournaments"                    [+ Create Tournament]│
├─────────────────────────────────────────────────────────────┤
│ Filters: [Search] [Status ▼] [Type ▼]                        │
├─────────────────────────────────────────────────────────────┤
│ Table:                                                        │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Title    │ Type  │ Dates      │ Location │ Status │ ⚙ │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ Spring   │ P1000 │ Mar 1-3    │ Paris    │ Draft  │ ✎ │   │
│ │ Summer   │ P500  │ Jun 15-17  │ Lyon     │ Pub... │ ✎ │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Tournament Detail Page (`/admin/tournaments/:id/...`)

#### Desktop View (≥ 1024px)
```
┌──────────────────┬──────────────────────────────────────────┐
│ Sidebar (384px)  │ Main Content Area                        │
│                  │                                          │
│ ← Back           │ ┌──────────────────────────────────────┐│
│                  │ │ Header: "Tournament Information"     ││
│ Tournament       │ │        [Cancel] [Save] [Publish]     ││
│ Details          │ └──────────────────────────────────────┘│
│ Spring Tour...   │                                          │
│ Mar 1-3, 2024    │ ┌──────────────┬──────────────────────┐│
│ Paris, France    │ │ Basic Info   │ Address              ││
│                  │ │              │                      ││
│ ──────────────   │ │ Title:       │ Address Line 1:     ││
│                  │ │ [________]   │ [_________________] ││
│ ⓘ Info           │ │              │                      ││
│   General config │ │ Type:        │ Address Line 2:     ││
│                  │ │ [P1000 ▼]    │ [_________________] ││
│ 👥 Participants  │ │              │                      ││
│   Manage players │ │ Starts At:   │ Postal / City:      ││
│                  │ │ [MM/DD/YYYY] │ [____] [_________] ││
│ 👥👥 Lineups     │ │              │                      ││
│   Team pairings  │ │ Ends At:     │ Country:            ││
│                  │ │ [MM/DD/YYYY] │ [_________________] ││
│                  │ │              │                      ││
│                  │ │              │ Lat/Long:           ││
│                  │ │              │ [____] [__________] ││
│                  │ └──────────────┴──────────────────────┘│
└──────────────────┴──────────────────────────────────────────┘
```

#### Mobile View (< 1024px)
```
┌────────────────────────────────────┐
│ ☰ Tournament Details               │
├────────────────────────────────────┤
│ Header: "Tournament Information"   │
│         [Cancel] [Save] [Publish]  │
├────────────────────────────────────┤
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Basic Information              │ │
│ │                                │ │
│ │ Title:                         │ │
│ │ [__________________________]   │ │
│ │                                │ │
│ │ Type:                          │ │
│ │ [P1000 ▼]                      │ │
│ │                                │ │
│ │ Starts At:                     │ │
│ │ [MM/DD/YYYY]                   │ │
│ │                                │ │
│ │ Ends At:                       │ │
│ │ [MM/DD/YYYY]                   │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Address                        │ │
│ │                                │ │
│ │ Address Line 1:                │ │
│ │ [__________________________]   │ │
│ │                                │ │
│ │ Address Line 2:                │ │
│ │ [__________________________]   │ │
│ │                                │ │
│ │ Postal Code / City:            │ │
│ │ [______] [________________]    │ │
│ │                                │ │
│ │ Country:                       │ │
│ │ [__________________________]   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Participants Tab (`/admin/tournaments/:id/participants`)
```
┌──────────────────┬──────────────────────────────────────────┐
│ Sidebar          │ Header: "Participants Management"        │
│ (same as above)  │                                          │
│                  │ ┌──────────────────────────────────────┐│
│                  │ │ Search users: [🔍______________]     ││
│                  │ └──────────────────────────────────────┘│
│                  │                                          │
│                  │ ┌──────────────────────────────────────┐│
│                  │ │ ☐ John Doe                           ││
│                  │ │   john.doe@email.com | Ranking: 150  ││
│                  │ ├──────────────────────────────────────┤│
│                  │ │ ☑ Jane Smith                         ││
│                  │ │   jane.smith@email.com | Ranking: 45 ││
│                  │ ├──────────────────────────────────────┤│
│                  │ │ ☑ Bob Wilson                         ││
│                  │ │   bob.wilson@email.com | Ranking: 32 ││
│                  │ └──────────────────────────────────────┘│
│                  │                                          │
│                  │ [Save Participants] 2 selected           │
└──────────────────┴──────────────────────────────────────────┘
```

### Lineups Tab (`/admin/tournaments/:id/lineups`)
```
┌──────────────────┬──────────────────────────────────────────┐
│ Sidebar          │ Header: "Team Lineups"                   │
│ (same as above)  │                       [Generate Teams]   │
│                  │                                          │
│                  │ ┌──────────────────────────────────────┐│
│                  │ │ ⋮⋮ Team 1          🥇 1st place      ││
│                  │ │    👤 Jane Smith (Ranking: 45)       ││
│                  │ │    👤 Bob Wilson (Ranking: 32)       ││
│                  │ └──────────────────────────────────────┘│
│                  │                                          │
│                  │ ┌──────────────────────────────────────┐│
│                  │ │ ⋮⋮ Team 2                            ││
│                  │ │    👤 Alice Brown (Ranking: 67)      ││
│                  │ │    👤 Charlie Davis (Ranking: 89)    ││
│                  │ └──────────────────────────────────────┘│
│                  │                                          │
│                  │ Drag ⋮⋮ to reorder teams                │
└──────────────────┴──────────────────────────────────────────┘
```

## Responsive Breakpoints

### Large Desktop (≥ 1024px)
- Sidebar always visible (side mode)
- Two-card layout in info section
- Full table layouts

### Tablet (768px - 1023px)
- Sidebar as overlay (over mode)
- Two-card layout in info section
- Adapted spacing

### Mobile (< 768px)
- Sidebar as overlay (over mode)
- Single column layout
- Stacked cards
- Touch-optimized targets

## Navigation Flow

```
Tournament List
    │
    ├─→ Create New ──→ Info Component (no sidebar)
    │                      │
    │                      └─→ Save ──→ Redirects to /:id/info
    │
    └─→ Click Tournament ──→ View Component with Sidebar
                                  │
                                  ├─→ Info Tab (default)
                                  ├─→ Participants Tab
                                  └─→ Lineups Tab
```

## Key Visual Features

### 1. Two-Card Layout (Info Tab)
On large screens, forms are split into two side-by-side cards:
- Left: Basic tournament information
- Right: Address and location details

This reduces vertical scrolling and better utilizes wide screens.

### 2. Sidebar Navigation
- Persistent on desktop
- Overlay drawer on mobile/tablet
- Active tab highlighted
- Tab descriptions for context
- Tournament summary at top

### 3. Empty States
- Friendly icons
- Clear messaging
- Actionable instructions
- Example: "No participants yet → Add participants first to generate teams"

### 4. Status Badges
- Color-coded tournament types (P250, P500, P1000, etc.)
- Status indicators (Draft, Published, Archived)
- Placement badges for teams

### 5. Drag & Drop
- Visual handle (⋮⋮) for dragging
- Hover effects
- Smooth animations
- Auto-save on drop

## Color Scheme

### Tournament Types
- P250: Blue (`bg-blue-100 text-blue-800`)
- P500: Green (`bg-green-100 text-green-800`)
- P1000: Purple (`bg-purple-100 text-purple-800`)
- P1500: Orange (`bg-orange-100 text-orange-800`)
- P2000: Red (`bg-red-100 text-red-800`)

### Status
- Draft: Yellow (`bg-yellow-100 text-yellow-800`)
- Published: Green (`bg-green-100 text-green-800`)
- Archived: Gray (`bg-gray-100 text-gray-800`)

### Placement
- All placements: Yellow (`bg-yellow-100 text-yellow-800`)

## Material Design Components Used

- `MatDrawer` / `MatSidenav` - Sidebar navigation
- `MatFormField` / `MatInput` - Form inputs
- `MatSelect` - Dropdowns
- `MatDatepicker` - Date selection
- `MatButton` - Actions
- `MatIcon` - Icons throughout
- `MatTooltip` - Hover help text
- `CdkDrag` / `CdkDropList` - Drag & drop functionality
