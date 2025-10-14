# Tournament Admin Interface - Testing Checklist

This document provides a comprehensive checklist for testing the refactored tournament admin interface.

## ✅ Pre-Testing Setup

- [ ] Ensure the application is running (`npm start`)
- [ ] Log in as an admin user
- [ ] Navigate to `/admin/tournaments`

## 1. Tournament List Page Tests

### Display & Layout
- [ ] Tournament list is visible with all columns (Title, Type, Dates, Location, Status, Actions)
- [ ] Type badges are color-coded correctly (P250=Blue, P500=Green, P1000=Purple, P1500=Orange, P2000=Red)
- [ ] Status badges are color-coded correctly (Draft=Yellow, Published=Green, Archived=Gray)
- [ ] Dates are formatted correctly based on locale

### Filters
- [ ] Search filter works (filters by title and city)
- [ ] Status dropdown filter works
- [ ] Type dropdown filter works
- [ ] Multiple filters work together
- [ ] Clearing filters shows all tournaments again

### Actions
- [ ] "Create Tournament" button is visible and clickable
- [ ] Edit icon buttons are visible for each tournament
- [ ] Publish button appears only for Draft tournaments
- [ ] Archive button appears only for Published tournaments
- [ ] Delete button is visible for all tournaments

### Responsive
- [ ] Table scrolls horizontally on mobile devices
- [ ] Buttons remain accessible on all screen sizes
- [ ] Filters stack vertically on mobile

## 2. Create Tournament (New) Tests

### Navigation
- [ ] Clicking "Create Tournament" navigates to `/admin/tournaments/new`
- [ ] Page shows "Create Tournament" header
- [ ] No sidebar is shown (direct form view)

### Form - Basic Info Card
- [ ] Title field is present and required
- [ ] Type dropdown is present with all 5 options (P250, P500, P1000, P1500, P2000)
- [ ] Start date picker is present and required
- [ ] End date picker is present and required
- [ ] Validation errors show for required fields

### Form - Address Card
- [ ] Address Line 1 field is present and required
- [ ] Address Line 2 field is present (optional)
- [ ] Postal Code and City fields are side-by-side on large screens
- [ ] Country field is present and required
- [ ] Latitude and Longitude fields are present (optional)
- [ ] Validation errors show for required fields

### Layout
- [ ] On large screens (≥1024px), two cards are side-by-side
- [ ] On tablets (768-1023px), two cards are side-by-side
- [ ] On mobile (<768px), cards stack vertically

### Actions
- [ ] Cancel button navigates back to tournament list
- [ ] Save button is disabled when form is invalid
- [ ] Save button is enabled when all required fields are filled
- [ ] Saving creates tournament and redirects to `/admin/tournaments/:id/info`

## 3. Tournament Detail - View Component Tests

### Navigation
- [ ] Clicking a tournament from the list navigates to `/admin/tournaments/:id`
- [ ] Automatically redirects to `/admin/tournaments/:id/info`
- [ ] Direct navigation to `/admin/tournaments/:id/participants` works
- [ ] Direct navigation to `/admin/tournaments/:id/lineups` works

### Sidebar (Desktop)
- [ ] Sidebar is visible on large screens (≥1024px)
- [ ] "Back to Tournaments" link is visible and works
- [ ] Tournament title is displayed
- [ ] Tournament dates are displayed
- [ ] Tournament location (city, country) is displayed
- [ ] Three tabs are visible: Info, Participants, Lineups
- [ ] Each tab shows an icon and description
- [ ] Active tab is highlighted

### Sidebar (Mobile/Tablet)
- [ ] Sidebar is an overlay drawer on small screens (<1024px)
- [ ] Drawer is closed by default
- [ ] Can open drawer (if there's a menu button)
- [ ] Close button (X) is visible in drawer
- [ ] Clicking a tab closes the drawer
- [ ] Active tab is highlighted

### Responsive
- [ ] Drawer mode changes at 1024px breakpoint
- [ ] Window resize updates drawer mode correctly

## 4. Info Tab Tests

### Navigation
- [ ] Tab is accessible at `/admin/tournaments/:id/info`
- [ ] Tab is highlighted as active
- [ ] Header shows "Tournament Information"

### Form Display
- [ ] All fields are populated with existing tournament data
- [ ] Tournament status badge is visible in header (Draft/Published)
- [ ] Two-card layout on large screens
- [ ] Single-column layout on mobile

### Actions (Draft Tournament)
- [ ] Cancel button is visible
- [ ] Save button is visible and enabled
- [ ] Publish button is visible for Draft tournaments
- [ ] Publish button validates participants and teams before publishing

### Actions (Published Tournament)
- [ ] Cancel button is visible
- [ ] Save button is visible
- [ ] Publish button is NOT visible for Published tournaments

### Functionality
- [ ] Editing fields and clicking Save updates the tournament
- [ ] Success message or visual feedback after save
- [ ] Cancel navigates back to tournament list

## 5. Participants Tab Tests

### Navigation
- [ ] Tab is accessible at `/admin/tournaments/:id/participants`
- [ ] Tab is highlighted as active
- [ ] Header shows "Participants Management"

### Search Functionality
- [ ] Search input is visible
- [ ] Search icon is present
- [ ] Typing filters users in real-time
- [ ] Search filters by first name, last name, and email
- [ ] Clearing search shows all users again

### User List
- [ ] All available users are displayed
- [ ] Each user shows: Name, Email, Ranking (if available)
- [ ] Checkboxes are present for each user
- [ ] Previously selected participants are pre-checked
- [ ] List scrolls if there are many users
- [ ] Clicking user row toggles checkbox

### Selection
- [ ] Clicking checkbox selects/deselects user
- [ ] Selected count updates in real-time
- [ ] "X selected" message is displayed

### Actions
- [ ] "Save Participants" button is visible
- [ ] Clicking Save updates the tournament participants
- [ ] Success feedback after save

### Empty State
- [ ] If no users match search, shows "No users found" message

### Responsive
- [ ] Layout adapts to mobile screens
- [ ] Touch-friendly tap targets
- [ ] Scrollable list on all screen sizes

## 6. Lineups Tab Tests

### Navigation
- [ ] Tab is accessible at `/admin/tournaments/:id/lineups`
- [ ] Tab is highlighted as active
- [ ] Header shows "Team Lineups"

### No Participants State
- [ ] If tournament has no participants, shows empty state
- [ ] Empty state has icon, message, and instructions
- [ ] Message: "No participants yet"
- [ ] Instructions: "Add participants first to generate teams"

### Generate Teams
- [ ] "Generate Teams" button is visible in header
- [ ] Button is disabled if less than 2 participants
- [ ] Clicking button generates homogeneous pairs
- [ ] Teams appear after generation

### Team Display
- [ ] Teams are displayed in order
- [ ] Each team shows: Team number, placement (if set), member names, rankings
- [ ] Drag handle (⋮⋮) is visible for each team
- [ ] Placement badges show correct ordinal (1st, 2nd, 3rd, etc.)

### Drag & Drop
- [ ] Cursor changes to move cursor when hovering over drag handle
- [ ] Can drag team to new position
- [ ] Team order updates visually
- [ ] Drop action saves new order to backend
- [ ] No errors in console during drag/drop

### Empty Teams State
- [ ] If no teams generated yet, shows message
- [ ] Message: "No teams generated yet"
- [ ] Instructions: "Click the button above to generate balanced team pairings"

### Responsive
- [ ] Team cards adapt to screen width
- [ ] Player information stacks on mobile
- [ ] Drag handles remain accessible on all devices

## 7. Integration Tests

### Data Persistence
- [ ] Refreshing page preserves tournament data
- [ ] Switching between tabs maintains form state
- [ ] Browser back/forward buttons work correctly

### Navigation Flow
- [ ] List → Create → Save → Redirects to Info tab
- [ ] List → Edit → Info tab (default)
- [ ] Info → Participants → Lineups → Back to List
- [ ] Direct URL navigation works for all routes

### Error Handling
- [ ] Invalid tournament ID shows error or redirects
- [ ] Network errors show appropriate messages
- [ ] Form validation errors are clear and helpful

## 8. Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome on Android
- [ ] Safari on iOS
- [ ] Firefox on Android

## 9. Accessibility Tests

### Keyboard Navigation
- [ ] Can tab through all form fields
- [ ] Can tab through sidebar tabs
- [ ] Enter key activates buttons
- [ ] Escape key closes drawer on mobile

### Screen Reader
- [ ] Form labels are announced correctly
- [ ] Required fields are indicated
- [ ] Error messages are announced
- [ ] Tab navigation is announced

### Color Contrast
- [ ] All text meets WCAG AA contrast requirements
- [ ] Status badges are readable
- [ ] Disabled states are clearly indicated

## 10. Performance Tests

### Load Times
- [ ] Tournament list loads in < 2 seconds
- [ ] Tournament detail loads in < 1 second
- [ ] Tab switching is instant (no loading)

### Large Data Sets
- [ ] List handles 100+ tournaments
- [ ] Participants list handles 100+ users
- [ ] Lineups handles 50+ teams
- [ ] Search/filter remains performant

## 11. Visual Regression

### Compare with Screenshots
- [ ] Tournament list matches design
- [ ] Two-card layout matches design
- [ ] Sidebar matches sessions sidebar design
- [ ] Mobile layouts match design
- [ ] Empty states match design

## 12. Translation Tests

### English
- [ ] All labels are in English
- [ ] All buttons are in English
- [ ] All messages are in English
- [ ] Date formats are correct for English locale

### French
- [ ] All labels are in French
- [ ] All buttons are in French
- [ ] All messages are in French
- [ ] Date formats are correct for French locale
- [ ] No missing translation keys

## Issues Found

Use this section to document any issues discovered during testing:

### Issue Template
```
- [ ] Issue #X: [Short Description]
  - Component: [Component name]
  - Steps to reproduce:
    1. 
    2. 
    3. 
  - Expected: [What should happen]
  - Actual: [What actually happened]
  - Severity: [Critical/High/Medium/Low]
  - Screenshot: [If applicable]
```

## Sign-Off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Issues documented and prioritized
- [ ] Ready for deployment

**Tester Name:** _______________
**Date:** _______________
**Browser/Device:** _______________
