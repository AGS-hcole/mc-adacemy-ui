# UI Mockup: Multi-Date Session Creation

## Before (Single Date)
```
┌─────────────────────────────────────────────────────────┐
│  Créer une session                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Site *                                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │ Centre Sportif                           ▼  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Date *                                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │ 16/10/2025                              📅  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Créneau *                                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Matin                                    ▼  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  [Annuler]                            [Créer]          │
└─────────────────────────────────────────────────────────┘
```

## After (Multiple Dates) - CREATE MODE
```
┌─────────────────────────────────────────────────────────┐
│  Créer une session                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Site *                                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │ Centre Sportif                           ▼  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Sélectionner des dates                                │
│  ┌──────────────────────────────────────────────┐      │
│  │                                         📅  │      │
│  └──────────────────────────────────────────────┘      │
│  Cliquez sur une date pour l'ajouter à la liste       │
│                                                         │
│  Dates sélectionnées (4)                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [ lun. 16 oct. 2025 ⓧ ]  [ mar. 17 oct. 2025 ⓧ ]  │
│  │  [ mer. 18 oct. 2025 ⓧ ]  [ jeu. 19 oct. 2025 ⓧ ]  │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Créneau *                                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Matin                                    ▼  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Heure de début         Heure de fin                   │
│  ┌──────────────┐       ┌──────────────┐              │
│  │ 09:00        │       │ 12:00        │              │
│  └──────────────┘       └──────────────┘              │
│                                                         │
│  Notes                                                  │
│  ┌──────────────────────────────────────────────┐      │
│  │ Entraînement intensif                        │      │
│  │                                              │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  ☑ Publier cette session                               │
│                                                         │
│  [Annuler]                            [Créer]          │
└─────────────────────────────────────────────────────────┘
```

## After (Multiple Dates) - EDIT MODE
```
┌─────────────────────────────────────────────────────────┐
│  Modifier la session                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Site *                                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │ Centre Sportif                           ▼  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Date *                      ← SINGLE DATE ONLY        │
│  ┌──────────────────────────────────────────────┐      │
│  │ 16/10/2025                              📅  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Créneau *                                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Matin                                    ▼  │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  [Annuler]                         [Enregistrer]       │
└─────────────────────────────────────────────────────────┘
```

## User Interaction Flow

### Creating Multiple Sessions

1. Admin clicks "Créer une session"
2. Selects a site from dropdown
3. Opens date picker calendar
4. Clicks on October 16 → Date chip appears: `[ lun. 16 oct. 2025 ⓧ ]`
5. Clicks on October 17 → Second chip appears: `[ mar. 17 oct. 2025 ⓧ ]`
6. Clicks on October 18 → Third chip appears
7. Clicks on October 19 → Fourth chip appears
8. (Optional) Clicks ⓧ on a chip to remove that date
9. Selects "Matin (AM)" slot
10. Keeps default times (09:00 - 12:00)
11. Adds notes
12. Checks "Publier cette session"
13. Clicks "Créer"
14. System creates 4 sessions in parallel
15. Redirects to sessions list

### Result in Sessions List

```
┌───────────────────────────────────────────────────────────────┐
│  Sessions d'entraînement                                      │
├───────────────────────────────────────────────────────────────┤
│  ┌────────────┬─────────┬──────────┬──────────┬──────────┐   │
│  │ Date       │ Site    │ Créneau  │ Horaire  │ Actions  │   │
│  ├────────────┼─────────┼──────────┼──────────┼──────────┤   │
│  │ 16/10/2025 │ Centre  │ Matin    │ 09:00-   │ [Edit]   │   │
│  │            │ Sportif │          │ 12:00    │ [Delete] │   │
│  ├────────────┼─────────┼──────────┼──────────┼──────────┤   │
│  │ 17/10/2025 │ Centre  │ Matin    │ 09:00-   │ [Edit]   │   │
│  │            │ Sportif │          │ 12:00    │ [Delete] │   │
│  ├────────────┼─────────┼──────────┼──────────┼──────────┤   │
│  │ 18/10/2025 │ Centre  │ Matin    │ 09:00-   │ [Edit]   │   │
│  │            │ Sportif │          │ 12:00    │ [Delete] │   │
│  ├────────────┼─────────┼──────────┼──────────┼──────────┤   │
│  │ 19/10/2025 │ Centre  │ Matin    │ 09:00-   │ [Edit]   │   │
│  │            │ Sportif │          │ 12:00    │ [Delete] │   │
│  └────────────┴─────────┴──────────┴──────────┴──────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Key Visual Elements

### Date Chips Design

The selected dates are displayed as chips with:
- **Light Mode**: Blue background (`bg-primary-100`), dark blue text (`text-primary-800`)
- **Dark Mode**: Dark blue background (`bg-primary-800`), light blue text (`text-primary-100`)
- **Remove Button**: Small X icon with hover effect
- **Format**: French locale format (e.g., "lun. 16 oct. 2025")

### Visual Feedback

- **No dates selected**: Red warning text "La date est requise"
- **Dates counter**: Shows count of selected dates "(4)"
- **Hover effect**: X button highlights on hover
- **Responsive**: Chips wrap to multiple lines if needed

### Calendar Picker Behavior

- Opens when clicking the calendar icon or input field
- Each click on a date adds it (doesn't close the picker)
- Prevents duplicate dates
- Sorts dates chronologically
- Calendar stays open for convenience
