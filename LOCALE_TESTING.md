# Visual Testing Guide for Date Localization

## Test Scenarios

### Scenario 1: Sessions List - Date Display

**Location**: Admin → Sessions List

**What to check**:
1. Navigate to the Sessions list page
2. Observe the date column in the table

**Expected Results**:

| Language | Desktop View | Tablet View | Mobile View |
|----------|--------------|-------------|-------------|
| French | mercredi 15 mars 2024 | 15/03/24 | mercredi 15 mars 2024 |
| English | Wednesday, March 15, 2024 | 3/15/24 | Wednesday, March 15, 2024 |

**How to test**:
- Switch to French: Dates should show day name in French, month in French
- Switch to English: Dates should show day name in English, month in English

---

### Scenario 2: Session Details - DatePicker

**Location**: Admin → Sessions → Create/Edit Session

**What to check**:
1. Click on the date field to open the DatePicker
2. Observe the calendar header and month/day labels

**Expected Results**:

| Language | Month Header | Day Labels | Date Format in Input |
|----------|--------------|------------|---------------------|
| French | mars 2024 | L, M, M, J, V, S, D | 15/03/2024 |
| English | March 2024 | S, M, T, W, T, F, S | 3/15/2024 |

**How to test**:
- Open the DatePicker in French: Should see French month names and French day abbreviations
- Switch to English and reopen: Should see English month names and English day abbreviations

---

### Scenario 3: User Details - Birth Date and Consent Dates

**Location**: Admin → Users → User Details

**What to check**:
1. Open any user's detail page
2. Scroll to see Birth Date and Consent information

**Expected Results**:

| Language | Birth Date Format | Consent DateTime Format |
|----------|-------------------|------------------------|
| French | 15/03/1990 | 15/03/2024 14:30 |
| English | 3/15/90 | 3/15/24, 2:30 PM |

**How to test**:
- View in French: Short date format DD/MM/YYYY, 24-hour time
- Switch to English: Short date format M/D/YY, 12-hour time with AM/PM

---

### Scenario 4: User Sessions List - Date Grouping

**Location**: User Portal → My Sessions

**What to check**:
1. Navigate to the sessions list
2. Observe the date headers grouping sessions

**Expected Results**:

| Language | Date Header Format |
|----------|-------------------|
| French | mercredi 15 mars 2024 |
| English | Wednesday, March 15, 2024 |

**How to test**:
- View in French: Full date with French day and month names
- Switch to English: Full date with English day and month names

---

## Quick Test Checklist

- [ ] Sessions list displays dates in correct format for French
- [ ] Sessions list displays dates in correct format for English
- [ ] DatePicker shows French labels when French is selected
- [ ] DatePicker shows English labels when English is selected
- [ ] User birth dates format correctly in both languages
- [ ] Consent timestamps format correctly with proper time notation (24h vs 12h)
- [ ] Date headers in user sessions list use full format
- [ ] Switching languages updates all dates immediately (no page refresh needed)

## Common Issues to Watch For

1. **Dates not updating on language switch**: The LocalizedDatePipe should be impure and respond immediately
2. **DatePicker still in wrong language**: The DateAdapter locale should update via the LocaleService
3. **Mixed date formats**: All dates should consistently use the same locale
4. **Time formats**: French uses 24-hour time, English uses 12-hour time with AM/PM

## Browser Testing

Test in the following browsers to ensure consistency:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)

## Device Testing

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)
