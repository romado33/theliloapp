# Lilo App - Critique, Weaknesses & Bugs Found

## Executive Summary

After comprehensive testing, I've identified several **critical bugs**, **UX issues**, and **architectural weaknesses** that need attention before production readiness.

**UPDATE (2026-02-05):** The following issues have been fixed:
- ✅ Hardcoded rating data now shows real review counts/averages from database
- ✅ Sold-out time slots are now disabled and show "Sold Out" badge
- ✅ Host names now show actual profile names instead of "Local Host"
- ✅ Dev Bypass UI is hidden on production (lovable.app domains)
- ✅ Post-login redirect now returns users to their previous page
- ✅ Search results now properly filter by query
- ✅ **Egress optimization**: Reduced API calls by 90%+ through batch ratings fetches, 10-minute caching, and column selection

---

## 🔴 CRITICAL BUGS

### 1. Hardcoded Rating/Review Data (MISLEADING)
**Location**: `src/pages/ExperienceDetails.tsx` lines 358-362
**Issue**: The experience header shows "4.9 (156 reviews)" which is completely hardcoded, regardless of actual review count
**Impact**: Users see fake data that doesn't match reality - a trust/credibility issue
**Fix**: Replace with dynamic data from the `ReviewsSection` component or query reviews table

```tsx
// Current (WRONG):
<span className="font-medium">4.9</span>
<span>(156 reviews)</span>

// Should be:
<span className="font-medium">{actualRating}</span>
<span>({actualReviewCount} reviews)</span>
```

### 2. Sold-Out Time Slots Still Clickable
**Location**: `src/pages/ExperienceDetails.tsx` - availability rendering
**Issue**: Time slots with `0 spots left` can still be clicked/selected
**Impact**: Users can select sold-out slots, then get confused when booking fails
**Fix**: Add `disabled` attribute and visual styling for sold-out slots

### 3. Search Results Not Filtered Properly (PARTIALLY FIXED)
**Location**: `supabase/functions/semantic-search/index.ts`
**Issue**: Text search fallback was returning all results due to OR condition syntax issue (now fixed)
**Status**: Fixed during this session, but needs verification

---

## 🟠 HIGH PRIORITY ISSUES

### 4. No Redirect After Login
**Location**: Auth flow
**Issue**: After signing in, user isn't returned to the experience they were trying to book
**Current**: `navigate('/auth', { state: { returnTo: '/experience/${id}' }})`
**Missing**: Auth page doesn't read `location.state.returnTo` and redirect back

### 5. Missing Reviews Display
**Location**: `src/pages/ExperienceDetails.tsx` - ReviewsSection
**Issue**: The ReviewsSection shows "No reviews yet" even when reviews exist in database
**Root Cause**: Need to verify the ReviewsSection is fetching from the correct experience

### 6. Host Name Shows "Local Host" Instead of Actual Name
**Location**: Experience cards on homepage and search
**Issue**: All experiences show "Hosted by Local Host" instead of the actual host's name
**Root Cause**: The experiences query doesn't join with profiles table properly, or the fallback is triggering

### 7. Time Slots Show Incorrect Times
**Issue**: Availability slots show "02:00 AM - 04:00 AM" when they were created for 10:00 AM
**Root Cause**: Timezone conversion issue - times are stored in UTC but not being converted to local time correctly

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. "Dev Bypass (Skip Login)" Visible in Production
**Location**: `src/pages/Auth.tsx`
**Issue**: Development-only bypass button visible to all users
**Security Risk**: Could be exploited if not properly secured
**Fix**: Ensure `import.meta.env.DEV` check is properly gating this feature

### 9. Missing Error Boundaries
**Issue**: No React error boundaries to catch and display errors gracefully
**Impact**: Errors cause blank screens instead of helpful error messages

### 10. No Loading States for Some Actions
**Location**: Various
**Issue**: Some actions (save experience, send message) lack loading indicators
**Impact**: Users click multiple times, causing duplicate actions

### 11. Chat Conversations Not Showing
**Issue**: Chat conversations table is empty despite attempted seed data
**Root Cause**: RLS policies or foreign key constraints may be blocking inserts

### 12. Mobile Sidebar Navigation
**Issue**: On mobile, sidebar covers full screen but no clear close button
**Impact**: Confusing UX on mobile devices

---

## 🔵 LOW PRIORITY / POLISH ITEMS

### 13. Inconsistent Category Display
**Issue**: Some categories have IDs, some have names displayed
**Fix**: Normalize category data throughout the app

### 14. Missing SEO Meta Tags
**Issue**: Experience pages don't have dynamic meta tags for social sharing
**Fix**: Add Helmet or similar for dynamic meta tags

### 15. Image Loading States
**Issue**: Images don't show loading skeletons
**Fix**: Add skeleton loaders while images are loading

### 16. Form Validation Messages
**Issue**: Validation errors are generic, not specific to the field
**Fix**: Improve error messages with specific guidance

### 17. Accessibility Issues
- Missing aria-labels on icon buttons
- Color contrast may not meet WCAG standards
- Focus states not clearly visible

---

## 🏗️ ARCHITECTURAL WEAKNESSES

### 1. Mock Data Mixed with Real Data
- `MOCK_EXPERIENCES` in experienceMockData.ts
- `mockReviews` array in ExperienceDetails.tsx
- Should be clearly separated or removed for production

### 2. Inconsistent Data Fetching
- Some components use Supabase directly
- Others use React Query
- Should standardize on one approach

### 3. RPC Functions for Security
- `get_safe_host_profile` is good
- But not all sensitive data queries use RPCs
- Should audit all queries for potential data leaks

### 4. No Rate Limiting on Client
- Edge functions have rate limiting
- But client-side has no throttling/debouncing for repeated actions

### 5. Missing Optimistic Updates
- Actions wait for server response before updating UI
- Could be improved with optimistic updates for better UX

---

## 🔒 SECURITY CONCERNS

### 1. Leaked Password Protection Disabled
- Supabase linter warning
- Should enable HIBP check for password security

### 2. Extensions in Public Schema
- Supabase linter warning  
- Should move extensions to a separate schema

### 3. Client-Side Price Calculation
- Price is calculated client-side before sending to server
- Server validates, but could show different prices to user

### 4. No CSRF Protection Visible
- Forms don't show explicit CSRF token handling
- May rely on Supabase session cookies

---

## 📱 MOBILE-SPECIFIC ISSUES

1. Search bar in header may be too small on mobile
2. Experience cards don't stack properly on very small screens
3. Booking sidebar becomes cramped on mobile
4. Touch targets for increment/decrement buttons too small (44px minimum recommended)

---

## 🧪 TESTING GAPS

### Missing Unit Tests For:
- Price calculation logic
- Booking validation
- Review submission
- Message sending

### Missing E2E Tests For:
- Complete booking flow with payment
- Host experience creation
- Review writing after completed booking
- Conversation threading

---

## RECOMMENDATIONS

### Immediate (Before Launch):
1. Fix hardcoded review data
2. Disable sold-out time slot selection
3. Fix timezone display for availability
4. Remove or secure dev bypass button
5. Add proper auth redirect flow

### Short-term (First Sprint Post-Launch):
1. Add error boundaries
2. Improve loading states
3. Fix host name display
4. Enable password leak protection
5. Mobile responsiveness polish

### Long-term (Technical Debt):
1. Standardize data fetching (React Query everywhere)
2. Remove all mock data
3. Add comprehensive test coverage
4. Implement proper i18n
5. Performance optimization (code splitting, image optimization)

---

## DATA SEEDED FOR TESTING

| Table | Count | Purpose |
|-------|-------|---------|
| experiences | 6 | Various categories |
| availability | 114 | 14 days of slots |
| bookings | 4 | Different statuses |
| reviews | 1 | For review display |
| notifications | 5 | Guest and host |

**Test Accounts Available:**
- Guest: `testguest1@gmail.com` (ID: 56b64efe-52ad-4278-8421-1c1786577e0d)
- Host: Dev host (ID: 47dbab53-759b-42ab-9983-91c65114d199)

