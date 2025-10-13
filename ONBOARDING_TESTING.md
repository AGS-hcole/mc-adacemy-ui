# Onboarding Flow - Testing Guide

## Manual Testing Checklist

### Prerequisites
- Application running (`npm start`)
- Backend API running and accessible
- Test user account without `privacyConsentAt` set

### Test Scenarios

#### ✅ Scenario 1: First-Time User Flow
**Goal:** Complete full onboarding as a new user

**Steps:**
1. Sign in with a user that has `mustOnboard=true`
2. Verify automatic redirect to `/onboarding`
3. Complete Step 1 (Profile):
   - Enter first name and last name
   - Optionally add phone, birth date, FFT license
   - Upload profile picture (test 2MB limit)
   - Click "Next"
4. Complete Step 2 (Contract):
   - Select a training formula
   - Toggle notification preferences
   - If SMS enabled without phone, verify warning appears
   - Click "Next"
5. Complete Step 3 (Consents):
   - Accept Privacy Policy (required)
   - Optionally accept photo and marketing
   - Click "Next"
6. Review Step 4 (Summary):
   - Verify all information displays correctly
   - Click "Finish"
7. Wait for success message
8. Verify redirect to dashboard
9. Try to navigate to `/onboarding` - should redirect to home

**Expected Results:**
- ✅ User redirected to `/onboarding` on login
- ✅ Cannot proceed without required fields
- ✅ Draft saved on each step
- ✅ Images preview correctly
- ✅ Summary shows all data
- ✅ Success message appears
- ✅ User can access dashboard after completion

---

#### ✅ Scenario 2: Draft Persistence
**Goal:** Verify draft saves across page reloads

**Steps:**
1. Start onboarding flow
2. Enter first and last name on Step 1
3. Click "Next" to go to Step 2
4. Select a formula
5. Refresh the page (F5 or Cmd+R)
6. Verify you're back at Step 1
7. Verify your name is still populated
8. Click "Next" to Step 2
9. Verify formula selection is still there

**Expected Results:**
- ✅ Form data persists across reloads
- ✅ Current step resets to 0 on reload
- ✅ All entered data is available

---

#### ✅ Scenario 3: Form Validation
**Goal:** Test all validation rules

**Profile Step:**
- [ ] First name required - try to click Next without entering
- [ ] First name min 2 chars - try entering "A"
- [ ] Last name required - try to click Next without entering
- [ ] Phone pattern - try entering invalid format "abc"
- [ ] Birth date max today - try selecting future date
- [ ] Avatar size - try uploading >2MB file
- [ ] Avatar type - try uploading .pdf file

**Contract Step:**
- [ ] Formula required - try to click Next without selecting

**Consents Step:**
- [ ] Privacy required - try to click Next without checking

**Expected Results:**
- ✅ Error messages display for invalid fields
- ✅ "Next" button disabled when form invalid
- ✅ Validation messages in correct language

---

#### ✅ Scenario 4: Image Upload
**Goal:** Test image preview and upload functionality

**Steps:**
1. Navigate to Profile step
2. Click "Upload" under Profile picture
3. Select a valid PNG image (<2MB)
4. Verify preview appears
5. Click "Remove" button
6. Verify preview disappears
7. Upload again with valid image
8. Upload a background image (<4MB)
9. Complete all steps and submit
10. Check if images uploaded to backend

**Test Cases:**
- [ ] Upload PNG image
- [ ] Upload JPEG image
- [ ] Upload JPG image
- [ ] Try to upload >2MB avatar (should fail)
- [ ] Try to upload >4MB background (should fail)
- [ ] Try to upload .gif image (should fail)
- [ ] Remove and re-upload image

**Expected Results:**
- ✅ Valid images show preview
- ✅ Invalid images show error alert
- ✅ Remove button works
- ✅ Images included in final submission

---

#### ✅ Scenario 5: Navigation
**Goal:** Test step navigation and back button

**Steps:**
1. Start onboarding
2. Complete Step 1, click "Next"
3. On Step 2, click "Back"
4. Verify you're on Step 1
5. Data should still be there
6. Click "Next" again to Step 2
7. Complete all steps to Summary
8. Click "Back" from Summary
9. Verify you're on Consents step

**Expected Results:**
- ✅ Back button navigates to previous step
- ✅ Data preserved when going back
- ✅ Progress indicator updates correctly
- ✅ Can't go back from Step 1

---

#### ✅ Scenario 6: Returning User
**Goal:** Verify completed users can't access onboarding

**Steps:**
1. Sign in with a user that has `mustOnboard=false`
2. Try to navigate to `/onboarding` manually
3. Verify redirect to home/dashboard
4. Navigate normally around the app
5. Verify no unexpected redirects

**Expected Results:**
- ✅ Cannot access `/onboarding` URL
- ✅ Redirected to home immediately
- ✅ No onboarding interruptions

---

#### ✅ Scenario 7: Error Handling
**Goal:** Test error scenarios and recovery

**Test Cases:**
1. **Network Error During Submit:**
   - Start onboarding
   - Complete all steps
   - Disconnect network
   - Click "Finish"
   - Verify error message appears
   - Reconnect network
   - Click "Finish" again
   - Should succeed

2. **API Error (400/500):**
   - Backend returns error
   - Error snackbar should appear
   - Form data should be preserved
   - User can retry

3. **Session Timeout:**
   - Token expires during onboarding
   - Should redirect to login
   - Draft should persist for next login

**Expected Results:**
- ✅ Errors shown in snackbar
- ✅ Form data not lost
- ✅ Retry capability available

---

#### ✅ Scenario 8: Internationalization
**Goal:** Test language switching

**Steps:**
1. Start onboarding in English
2. Verify all labels are in English
3. Switch language to French (if app supports)
4. Verify all labels update to French
5. Form data should remain unchanged

**Expected Results:**
- ✅ All UI strings translated
- ✅ Form validation messages translated
- ✅ Success/error messages translated

---

#### ✅ Scenario 9: Accessibility
**Goal:** Test keyboard navigation and screen reader

**Steps:**
1. Start onboarding
2. Use only keyboard (Tab, Enter, Space)
3. Navigate through all form fields
4. Submit using keyboard
5. Test with screen reader (NVDA/JAWS/VoiceOver)

**Keyboard Tests:**
- [ ] Tab moves through fields in order
- [ ] Enter submits when on button
- [ ] Space toggles checkboxes
- [ ] Datepicker opens with Enter
- [ ] Select opens with Enter
- [ ] Focus indicators visible

**Screen Reader Tests:**
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Step progress announced
- [ ] Button states communicated

**Expected Results:**
- ✅ Full keyboard accessibility
- ✅ Logical tab order
- ✅ Screen reader compatible

---

#### ✅ Scenario 10: Responsive Design
**Goal:** Test on different screen sizes

**Devices to Test:**
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

**What to Check:**
- [ ] Layout adapts correctly
- [ ] No horizontal scroll
- [ ] Buttons accessible
- [ ] Text readable
- [ ] Images scale properly
- [ ] Step indicators visible

**Expected Results:**
- ✅ Works on all screen sizes
- ✅ Touch-friendly on mobile
- ✅ Readable text everywhere

---

## Mock Data for Testing

### Test User Profiles

#### User 1: Needs Onboarding
```json
{
  "id": "user-1",
  "email": "newuser@example.com",
  "firstname": null,
  "lastname": null,
  "privacyConsentAt": null,
  "mustOnboard": true
}
```

#### User 2: Completed Onboarding
```json
{
  "id": "user-2",
  "email": "existinguser@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "privacyConsentAt": "2025-01-15T10:00:00Z",
  "mustOnboard": false
}
```

### Sample API Responses

#### POST /api/users/me (Success)
```json
{
  "id": "user-1",
  "email": "newuser@example.com",
  "firstname": "Jane",
  "lastname": "Smith",
  "phone": "+33612345678",
  "formula": "FULL",
  "notifyEmail": true,
  "notifySMS": false,
  "notifyWhatsApp": false,
  "updatedAt": "2025-01-15T12:00:00Z"
}
```

#### PUT /api/users/me/consents (Success)
```json
{
  "success": true,
  "consents": {
    "privacyConsentAt": "2025-01-15T12:00:00Z",
    "photoConsentAt": "2025-01-15T12:00:00Z",
    "marketingConsentAt": null
  }
}
```

#### POST /api/users/me/avatar (Success)
```json
{
  "ok": true,
  "avatarUrl": "https://api.example.com/avatars/user-1.jpg"
}
```

### Sample Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "FFT license number already exists",
  "error": "Bad Request"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Browser Testing

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues
- None currently

---

## Performance Testing

### Metrics to Check
- [ ] Initial load time < 3s
- [ ] Step transition < 100ms
- [ ] Image preview < 500ms
- [ ] Form validation < 50ms
- [ ] Submission complete < 5s

### Tools
- Chrome DevTools Performance tab
- Lighthouse audit
- Network throttling (3G/4G)

---

## Debugging Tips

### Common Issues

**Issue: Guard not redirecting**
```typescript
// Check in browser console:
console.log(authService.mustOnboard);
console.log(router.url);
```

**Issue: Draft not saving**
```typescript
// Check localStorage in DevTools:
localStorage.getItem('onboarding:v1');
```

**Issue: Images not uploading**
```typescript
// Check network tab for failed requests
// Verify Content-Type: multipart/form-data
```

**Issue: Form validation not working**
```typescript
// Check form validity:
console.log(this.form.valid);
console.log(this.form.errors);
console.log(this.form.get('firstname').errors);
```

### Enable Debug Logging

Add to component:
```typescript
ngOnInit() {
  this.form.valueChanges.subscribe(value => {
    console.log('Form value:', value);
    console.log('Form valid:', this.form.valid);
  });
}
```

---

## Automated Testing (Future)

### E2E Test Example (Playwright/Cypress)

```typescript
describe('Onboarding Flow', () => {
  it('should complete onboarding successfully', () => {
    // Login as new user
    cy.login('newuser@example.com', 'password');
    
    // Should redirect to onboarding
    cy.url().should('include', '/onboarding');
    
    // Step 1: Profile
    cy.get('input[formControlName="firstname"]').type('John');
    cy.get('input[formControlName="lastname"]').type('Doe');
    cy.contains('button', 'Next').click();
    
    // Step 2: Contract
    cy.get('mat-select[formControlName="formula"]').click();
    cy.contains('Full access').click();
    cy.contains('button', 'Next').click();
    
    // Step 3: Consents
    cy.get('mat-checkbox[formControlName="acceptPrivacy"]').click();
    cy.contains('button', 'Next').click();
    
    // Step 4: Summary & Submit
    cy.contains('button', 'Finish').click();
    
    // Should redirect to dashboard
    cy.url().should('not.include', '/onboarding');
    cy.contains('Your profile is complete');
  });
});
```

---

## Checklist Summary

Before marking implementation complete:

- [ ] All validation working
- [ ] Draft persistence working
- [ ] Image upload working
- [ ] All 4 steps functional
- [ ] Guard redirects correctly
- [ ] Submission pipeline works
- [ ] Error handling works
- [ ] Translations complete (EN/FR)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] Build successful
- [ ] No console errors
- [ ] Documentation complete

## Next Steps

After frontend testing:
1. Backend API implementation
2. End-to-end integration testing
3. User acceptance testing (UAT)
4. Performance optimization
5. Production deployment
