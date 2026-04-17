# Quick Start: Running End-to-End Integration Tests

**Purpose:** Get backend & frontend running and execute integration tests immediately  
**Duration:** 10 minutes setup + 4-6 hours testing  

---

## 🚀 STEP 1: Start Backend (5 minutes)

```bash
# Terminal 1: Navigate to backend
cd /workspaces/College_Administration_Management_System/backend

# Install dependencies (if not already done)
npm install

# Start backend development server
npm run dev

# Expected output:
# Server running on port 5000 ✓
# MongoDB Connected ✓
# Ready for API requests ✓
```

**Verify Backend Ready:**
```bash
# In a new terminal, test health check
curl http://localhost:5000/api/health
# Should return: { status: "ok" }
```

---

## 🚀 STEP 2: Start Frontend (5 minutes)

```bash
# Terminal 2: Navigate to frontend
cd /workspaces/College_Administration_Management_System/frontend

# Install dependencies (if not already done)
npm install

# Start frontend development server
npm run dev

# Expected output:
# ➜ Local:   http://localhost:5173/
# ➜ press h to show help

# Open browser and navigate to http://localhost:5173
```

**Verify Frontend Ready:**
- Page loads without console errors
- Login form appears

---

## 🔐 STEP 3: Login with Test Account

1. **Navigate to:** http://localhost:5173/login
2. **Use credentials:**
   - Email: `student@example.com` (or any student created in backend)
   - Password: `password123`
3. **Click:** Login button
4. **Expected:** Redirects to Student Dashboard

**Note:** If no test account exists, register a new account first:
1. Go to http://localhost:5173/register
2. Create student account
3. Login with new credentials

---

## 📋 STEP 4: Execute Integration Tests

### Option A: Structured Testing (Recommended)

1. **Open:** `INTEGRATION_TEST_PLAN.md`
2. **Start with Test Suite 1:** Payment System
3. **For each test case:**
   - Read test steps
   - Execute steps in the app
   - Check expected result
   - Mark PASS or FAIL in the document
   - Take screenshot if FAIL

4. **Continue through all test suites:**
   - Payment System (5 tests)
   - Event Analytics (3 tests)
   - Event Calendar (3 tests)
   - Event Check-In (4 tests)
   - Event Reschedule (3 tests)
   - Event Cancellation (3 tests)
   - Error Handling (3 tests)
   - Mobile (2 tests - optional)

### Option B: Quick Smoke Test (5-10 minutes)

**Test Most Critical Features:**

```
1. StudentPaymentsPage
   ✓ Load page: /student/payments
   ✓ See pending fees
   ✓ See payment history
   ✓ Click "Pay" button
   ✓ Razorpay modal opens

2. EventAnalyticsDashboard
   ✓ Access analytics page (if admin role)
   ✓ See metrics cards
   ✓ See bar chart
   ✓ See pie chart

3. EventCalendarView
   ✓ Access calendar (if available)
   ✓ See calendar grid
   ✓ Click next/prev month
   ✓ See events on dates

4. EventDetails
   ✓ Click event
   ✓ See event modal
   ✓ See RSVP buttons (student)
   ✓ See admin buttons (if admin/teacher)
```

**If all pass:** Core integration is working ✅

---

## 🔍 DEBUGGING TIPS

### Check Browser Console
- **Ctrl+Shift+J** (Windows/Linux) or **Cmd+Option+J** (Mac)
- Look for ANY red errors (not yellow warnings)
- Redux thunks should show in console with action names

### Check Network Tab
- **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Option+E** (Mac)
- Look for API calls:
  - `/api/payments/pending-fees`
  - `/api/events/analytics`
  - `/api/events/calendar`
  - etc.
- Check response status (should be 200, 201, etc.)
- Check response body for data

### Use Redux DevTools
1. **Install:** [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/)
2. **Open Extension:** Click Redux icon in toolbar
3. **View State:** See live Redux state changes
4. **Track Actions:** See which thunks dispatched
5. **Check Errors:** Look for rejected actions with error messages

### Check Backend Logs
- Terminal 1 where backend is running
- Should show API requests as they come in
- Look for any 500 errors
- Check database errors

---

## ❌ COMMON ISSUES & SOLUTIONS

### Issue: "Cannot GET /api/payments/pending-fees"
**Solution:**
- Backend not running on port 5000
- API route not implemented
- Check backend/src/routes/payments.js exists
- Check routes mounted in server.js
- Run: `npm run dev` in backend terminal again

### Issue: "Network Error" in Frontend
**Solution:**
- Check backend is running: `curl http://localhost:5000/api/health`
- Check browser console Network tab for the failing request
- Check Request URL matches API (should be localhost:5000)
- Check response Status (401 = auth issue, 500 = server error)

### Issue: "Redux state is empty"
**Solution:**
- Open Redux DevTools
- Check if thunk was dispatched
- Check if thunk was fulfilled or rejected
- If rejected, read error message
- Check console for error details

### Issue: "Login not working"
**Solution:**
- Check backend auth endpoint: `curl -X POST http://localhost:5000/api/auth/login`
- Verify student account exists in database
- Check MongoDB connection in backend
- Look at backend console for auth errors
- Try registering new account instead

### Issue: "Razorpay modal doesn't appear"
**Solution:**
- Check browser console for errors
- Check if Razorpay script loaded (Network tab)
- Check if amount is valid (> 0)
- Check if env vars set correctly
- Try in incognito mode (clear cache/cookies)

---

## 📊 WHAT YOU'RE TESTING

### Payment Flow
```
Login → Dashboard → Payments Section → 
Enter Amount → Click Pay → Razorpay Modal → 
[Simulate Payment] → Verify Success → 
Payment History Updated
```

### Event Analytics Flow
```
Login (as admin/teacher) → Analytics Page → 
See Charts/Metrics → Filter Data (optional) → 
Success
```

### Event Calendar Flow
```
Login → Events Section → Calendar View → 
Navigate Months → Click Date → See Events → 
Success
```

### Event Check-In Flow
```
Login (as admin/teacher) → Event Details → 
Click Check-In Button → Check-In Modal → 
Search Attendee → Click Check-In → 
Mark Complete → Success
```

### Event Reschedule Flow
```
Login (as admin/teacher) → Event Details → 
Click Reschedule → Modal Opens → 
Select New Date/Time → Click Reschedule → 
Success Toast → Modal Closes
```

### Event Cancellation Flow
```
Login (as admin/teacher) → Event Details → 
Click Cancel → Confirmation Modal → 
Add Reason (optional) → Click Cancel Event → 
Success Toast → Modal Closes
```

---

## ✅ SUCCESS INDICATORS

### All Tests Are Passing When:
- ✅ Login works
- ✅ Pages load without console errors  
- ✅ API calls show 200/201 status in Network tab
- ✅ Redux DevTools shows fulfilled actions
- ✅ Toast notifications appear on success
- ✅ Forms submit and reset properly
- ✅ Loading spinners appear during requests
- ✅ Error messages display on failures
- ✅ No console red errors

---

## 🎯 TEST EXECUTION CHECKLIST

**Before Testing:**
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Browser DevTools open (F12)
- [ ] Redux DevTools installed
- [ ] Test logged in with student account

**During Testing:**
- [ ] Check Network tab for API calls
- [ ] Check Redux DevTools for state changes
- [ ] Note any error messages
- [ ] Take screenshots of failures
- [ ] Mark Pass/Fail in INTEGRATION_TEST_PLAN.md

**After Testing:**
- [ ] All test cases completed
- [ ] Results documented
- [ ] Screenshots of failures attached
- [ ] Summary report prepared

---

## 📝 REPORTING RESULTS

### If Tests PASS ✅
```
All integration tests PASSED
Test coverage: 26/26 cases
Issues found: 0
Ready for production deployment
```

### If Tests FAIL ❌
```
Test failed: [Test Name]
Step: [Which step failed]
Expected: [What should happen]
Actual: [What happened]
Error message: [Console/network error]
Screenshot: [Attached]
Reproducible: Yes/No
Workaround: [If any]
```

---

## 🔄 RUNNING TESTS AGAIN

### After Fixing Code:
```bash
# Stop both servers (Ctrl+C in both terminals)
# Run fresh build in frontend
cd frontend
npm run build

# Restart both servers
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# Re-login and run tests again
```

---

## ⏱️ TIMELINE

| Step | Duration | Task |
|------|----------|------|
| Setup | 10 min | Start backend, start frontend, login |
| Payment Tests | 30 min | 5 test cases |
| Analytics Tests | 20 min | 3 test cases |
| Calendar Tests | 20 min | 3 test cases |
| Check-In Tests | 30 min | 4 test cases |
| Reschedule Tests | 20 min | 3 test cases |
| Cancellation Tests | 20 min | 3 test cases |
| Error Handling Tests | 20 min | 3 test cases |
| Mobile Tests | 15 min | 2 test cases (optional) |
| **Total** | **~4-6 hours** | Full test suite |

---

## 🆘 WHEN STUCK

1. **Check Console:** F12 → Console tab → Look for red errors
2. **Check Network:** F12 → Network tab → Run action → See request/response
3. **Check Redux:** Click Redux DevTools → See state
4. **Check Backend Logs:** Look at backend terminal
5. **Restart Servers:** Ctrl+C both, then `npm run dev` both
6. **Clear Cache:** Hard refresh (Ctrl+Shift+R) or incognito mode
7. **Re-login:** Log out and log in again
8. **Check Documentation:** Read relevant .md file

---

**You're ready to test! Good luck! 🚀**
