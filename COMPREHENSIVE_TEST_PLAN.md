# Lilo App - Comprehensive Test Plan

## Database Status (Test Data)
- **6 Experiences**: Pottery, Wine Tasting, Family Farm, Italian Pasta, Sunset Yoga, Gatineau Hike
- **114 Availability Slots**: Next 14 days, morning and afternoon slots
- **4 Bookings**: 1 confirmed, 1 pending, 1 completed, 1 cancelled
- **1 Review**: 5-star review on Italian Pasta class
- **5 Notifications**: Various types for guest and host
- **1 Sold-out Slot**: For waitlist testing

---

## SECTION 1: NAVIGATION & RESPONSIVE TESTING

### 1.1 Header Navigation
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| NAV-01 | Logo click | Click Lilo logo | Navigate to homepage | |
| NAV-02 | Search bar input | Type "pottery" in search | Input accepts text | |
| NAV-03 | Search submit (Enter) | Type "pottery", press Enter | Navigate to /search?q=pottery | |
| NAV-04 | Search submit (Button) | Type "pottery", click Search button | Navigate to /search?q=pottery | |
| NAV-05 | Location dropdown | Click location input | Shows location options | |
| NAV-06 | Host button (logged out) | Click "Host an experience" | Navigate to /auth | |
| NAV-07 | Host button (logged in) | Click "Host an experience" | Navigate to /host-dashboard | |

### 1.2 Sidebar Navigation
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SID-01 | Sidebar toggle | Click hamburger menu | Sidebar opens/closes | |
| SID-02 | Home link | Click Home in sidebar | Navigate to / | |
| SID-03 | Search link | Click Search | Navigate to /search | |
| SID-04 | Messages link | Click Messages (logged in) | Navigate to /messages | |
| SID-05 | Bookings link | Click My Bookings | Navigate to /bookings | |
| SID-06 | Saved link | Click Saved | Navigate to /saved | |
| SID-07 | Profile link | Click Profile | Navigate to /profile | |
| SID-08 | Settings link | Click Settings | Navigate to /settings | |
| SID-09 | Host Dashboard link | Click Host Dashboard (as host) | Navigate to /host-dashboard | |
| SID-10 | Logout button | Click Logout | Signs out, redirects to home | |

### 1.3 Footer Navigation
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| FTR-01 | Privacy Policy link | Click Privacy Policy | Navigate to /privacy | |
| FTR-02 | Terms of Service link | Click Terms of Service | Navigate to /terms | |
| FTR-03 | Support link | Click Support | Navigate to /support | |
| FTR-04 | Pricing link | Click Pricing | Navigate to /pricing | |

### 1.4 Mobile Responsiveness
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| MOB-01 | Header on mobile | Resize to 375px width | Header adapts, search collapses | |
| MOB-02 | Sidebar on mobile | Open sidebar on mobile | Full-screen overlay | |
| MOB-03 | Experience cards | View cards on mobile | Single column layout | |
| MOB-04 | Experience details | View details on mobile | Stacked layout, readable | |
| MOB-05 | Booking modal | Open quick book modal | Modal fits screen | |

---

## SECTION 2: GUEST USER FLOWS

### 2.1 Authentication
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| AUTH-01 | Sign up form display | Navigate to /auth | Shows sign up/sign in tabs | |
| AUTH-02 | Email validation | Enter invalid email | Shows validation error | |
| AUTH-03 | Password validation | Enter weak password | Shows strength indicator | |
| AUTH-04 | Successful sign up | Complete valid sign up | Creates account, redirects | |
| AUTH-05 | Sign in | Enter valid credentials | Logs in, redirects to home | |
| AUTH-06 | Sign out | Click logout in sidebar | Signs out, clears session | |
| AUTH-07 | Protected route | Access /bookings logged out | Redirects to /auth | |
| AUTH-08 | Remember session | Close/reopen browser | Session persists | |

### 2.2 Search & Discovery
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SRC-01 | Homepage search | Type "pottery", submit | Shows pottery workshop | |
| SRC-02 | Empty search | Submit empty search | Shows all experiences | |
| SRC-03 | No results search | Search "xyz123" | Shows "no results" message | |
| SRC-04 | Category filter | Click category on homepage | Filters by category | |
| SRC-05 | Price filter | Set max price $50 | Shows only matching experiences | |
| SRC-06 | Location filter | Enter location | Filters by location | |
| SRC-07 | Advanced search | Use advanced filters | Combines filters correctly | |
| SRC-08 | Search persistence | Search, navigate away, back | Remembers search state | |

### 2.3 Experience Details
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EXP-01 | View experience | Click experience card | Opens /experience/:id | |
| EXP-02 | Image gallery | Click through images | Carousel works | |
| EXP-03 | Host info display | View host section | Shows host name, avatar | |
| EXP-04 | Reviews display | Scroll to reviews | Shows review with rating | |
| EXP-05 | What's included | View inclusions list | Shows bullet points | |
| EXP-06 | What to bring | View requirements | Shows bullet points | |
| EXP-07 | Cancellation policy | View policy section | Shows policy text | |
| EXP-08 | Map display | View location map | Map loads correctly | |
| EXP-09 | Share buttons | Click share buttons | Opens share dialogs | |
| EXP-10 | Save experience | Click save/heart button | Toggles saved state | |

### 2.4 Booking Flow
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| BKG-01 | Quick Book button | Click "Quick Book" on card | Opens booking modal | |
| BKG-02 | Book Now button | Click "Book Now" on details | Opens booking modal | |
| BKG-03 | Select date | Choose available date | Shows time slots | |
| BKG-04 | Select time slot | Choose time slot | Slot gets selected | |
| BKG-05 | Guest count | Increase guest count | Updates price total | |
| BKG-06 | Max guests limit | Try to exceed max | Shows limit message | |
| BKG-07 | Special requests | Enter special request | Text saves | |
| BKG-08 | Contact info | Fill contact form | Validates fields | |
| BKG-09 | Price calculation | Check total | Correct: guests × price | |
| BKG-10 | Confirm booking | Submit booking | Creates booking, confirmation | |
| BKG-11 | Sold-out slot | Select sold-out date | Shows waitlist option | |
| BKG-12 | Join waitlist | Click join waitlist | Adds to waitlist | |

### 2.5 Payment Flow
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PAY-01 | Payment button | Click "Proceed to Payment" | Initiates Stripe checkout | |
| PAY-02 | Stripe redirect | After clicking pay | Redirects to Stripe | |
| PAY-03 | Payment success | Complete test payment | Redirects to success page | |
| PAY-04 | Payment cancel | Cancel in Stripe | Redirects to cancel page | |
| PAY-05 | Booking status | After payment | Booking marked confirmed | |

### 2.6 User Dashboard
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| DSH-01 | View bookings | Navigate to /bookings | Shows user's bookings | |
| DSH-02 | Filter by status | Click status filters | Filters bookings | |
| DSH-03 | Upcoming bookings | View upcoming tab | Shows future bookings | |
| DSH-04 | Past bookings | View completed tab | Shows past bookings | |
| DSH-05 | Booking details | Click booking card | Expands details | |
| DSH-06 | Modify booking | Click modify (pending) | Opens modify dialog | |
| DSH-07 | Cancel booking | Click cancel | Cancels after confirm | |
| DSH-08 | Calendar export | Click export button | Downloads ICS file | |

### 2.7 Reviews
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| REV-01 | Write review button | On completed booking | Shows "Write Review" | |
| REV-02 | Review modal | Click write review | Opens review form | |
| REV-03 | Star rating | Click stars | Selects rating | |
| REV-04 | Review text | Enter comment | Text saves | |
| REV-05 | Submit review | Submit review | Creates review, shows on exp | |
| REV-06 | One review limit | Try reviewing again | Shows "already reviewed" | |

### 2.8 Messaging
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| MSG-01 | Contact host button | Click on experience page | Opens/creates conversation | |
| MSG-02 | View conversations | Navigate to /messages | Lists conversations | |
| MSG-03 | Open conversation | Click conversation | Shows message thread | |
| MSG-04 | Send message | Type and send | Message appears | |
| MSG-05 | Real-time updates | Receive message | Shows without refresh | |
| MSG-06 | Unread indicator | New message received | Shows unread badge | |

---

## SECTION 3: HOST USER FLOWS

### 3.1 Host Onboarding
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| HST-01 | Become host button | Click "Host an experience" | Starts host flow | |
| HST-02 | Host profile setup | Fill host profile | Saves host info | |
| HST-03 | Role switch | Toggle to host role | Shows host dashboard | |

### 3.2 Experience Creation
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| CRT-01 | Create new button | Click "Create Experience" | Opens create form | |
| CRT-02 | Title input | Enter title | Validates min length | |
| CRT-03 | Description | Enter description | Accepts text | |
| CRT-04 | Category select | Choose category | Selects category | |
| CRT-05 | Location/address | Enter location | Address saves | |
| CRT-06 | Price input | Enter price | Validates number | |
| CRT-07 | Duration input | Set duration | Accepts hours | |
| CRT-08 | Max guests | Set max guests | Validates number | |
| CRT-09 | Photo upload | Upload images | Images upload | |
| CRT-10 | What's included | Add inclusions | List saves | |
| CRT-11 | Requirements | Add requirements | List saves | |
| CRT-12 | Cancellation policy | Enter policy | Text saves | |
| CRT-13 | Submit experience | Submit form | Creates experience | |
| CRT-14 | Experience status | After creation | Shows "pending review" | |

### 3.3 Experience Management
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| MGT-01 | View my experiences | Host dashboard | Lists host's experiences | |
| MGT-02 | Edit experience | Click edit button | Opens edit form | |
| MGT-03 | Update details | Change and save | Updates experience | |
| MGT-04 | Toggle active | Activate/deactivate | Changes is_active | |
| MGT-05 | Delete experience | Delete experience | Removes (or archives) | |

### 3.4 Availability Management
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| AVL-01 | View calendar | Open availability tab | Shows calendar | |
| AVL-02 | Add slot | Click date, add slot | Creates availability | |
| AVL-03 | Set capacity | Enter max spots | Saves capacity | |
| AVL-04 | Remove slot | Delete availability | Removes slot | |
| AVL-05 | Recurring slots | Set recurring pattern | Creates multiple slots | |
| AVL-06 | View bookings on slot | Click booked slot | Shows booking info | |

### 3.5 Booking Management (Host)
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| HBK-01 | View all bookings | Bookings tab | Lists all bookings | |
| HBK-02 | Filter by status | Use status filters | Filters correctly | |
| HBK-03 | View guest info | Click booking | Shows guest details | |
| HBK-04 | Confirm booking | Confirm pending booking | Status changes | |
| HBK-05 | Cancel booking | Cancel booking | Notifies guest | |
| HBK-06 | Message guest | Click message button | Opens conversation | |

### 3.6 Revenue Analytics
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| REV-01 | View analytics | Open analytics tab | Shows revenue data | |
| REV-02 | Date range filter | Change date range | Updates charts | |
| REV-03 | Total revenue | Check totals | Correct calculations | |
| REV-04 | Booking count | View booking stats | Accurate counts | |

---

## SECTION 4: SYSTEM FEATURES

### 4.1 Notifications
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| NTF-01 | View notifications | Click bell icon | Opens notification panel | |
| NTF-02 | Unread badge | Have unread notifs | Shows count badge | |
| NTF-03 | Mark as read | Click notification | Marks as read | |
| NTF-04 | Notification types | View different types | Correct icons/styling | |

### 4.2 Saved Experiences
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SAV-01 | Save experience | Click heart on card | Adds to saved | |
| SAV-02 | View saved | Navigate to /saved | Shows saved list | |
| SAV-03 | Remove saved | Click heart again | Removes from saved | |
| SAV-04 | Empty saved | No saved items | Shows empty state | |

### 4.3 Profile Management
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PRF-01 | View profile | Navigate to /profile | Shows user info | |
| PRF-02 | Edit name | Change first/last name | Updates profile | |
| PRF-03 | Upload avatar | Upload profile photo | Updates avatar | |
| PRF-04 | Update bio | Edit bio text | Saves changes | |
| PRF-05 | Change phone | Update phone number | Validates, saves | |

### 4.4 Settings
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SET-01 | View settings | Navigate to /settings | Shows settings page | |
| SET-02 | Delete account | Click delete account | Shows confirmation | |
| SET-03 | Confirm delete | Confirm deletion | Deletes account | |

---

## SECTION 5: EDGE CASES & ERROR HANDLING

### 5.1 Error States
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| ERR-01 | Invalid route | Navigate to /xyz | Shows 404 page | |
| ERR-02 | Invalid experience ID | Navigate to /experience/fake-id | Shows error/not found | |
| ERR-03 | Network error | Disable network | Shows error state | |
| ERR-04 | API timeout | Slow network | Shows loading, then error | |
| ERR-05 | Form validation | Submit invalid data | Shows field errors | |

### 5.2 Edge Cases
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EDG-01 | Double booking | Book same slot twice | Prevents duplicate | |
| EDG-02 | Past date booking | Try to book past date | Disables/prevents | |
| EDG-03 | Zero guests | Set guests to 0 | Validates minimum | |
| EDG-04 | Negative price | Enter -50 for price | Validates positive | |
| EDG-05 | XSS in inputs | Enter script tags | Sanitizes input | |
| EDG-06 | Very long text | 10000 char description | Handles gracefully | |
| EDG-07 | Special characters | Unicode in names | Handles correctly | |
| EDG-08 | Concurrent booking | Two users same slot | One fails gracefully | |

### 5.3 Security Tests
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SEC-01 | Access other user data | Try to view other's bookings | Blocked by RLS | |
| SEC-02 | Modify other booking | API call to edit | Returns 401/403 | |
| SEC-03 | SQL injection | Enter SQL in inputs | Properly escaped | |
| SEC-04 | Price manipulation | Modify price client-side | Server validates | |
| SEC-05 | Auth token expiry | Use expired token | Prompts re-login | |

---

## SECTION 6: INTEGRATION TESTS

### 6.1 Stripe Integration
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| STR-01 | Checkout session | Start payment | Creates session | |
| STR-02 | Success webhook | Complete payment | Updates booking | |
| STR-03 | Subscription | Subscribe to plan | Activates subscription | |
| STR-04 | Customer portal | Access billing | Opens Stripe portal | |

### 6.2 Email Integration
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| EML-01 | Booking confirmation | Complete booking | Email sent | |
| EML-02 | Reminder email | Day before booking | Email sent | |
| EML-03 | Cancellation email | Cancel booking | Email sent | |

### 6.3 Map Integration
| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| MAP-01 | Experience location | View experience | Map shows marker | |
| MAP-02 | Search by location | Enter location | Filters nearby | |
| MAP-03 | Map interaction | Pan/zoom | Works correctly | |

---

## KNOWN ISSUES & WEAKNESSES TO INVESTIGATE

### Critical Areas to Stress Test:
1. **Search functionality** - Text fallback vs semantic search
2. **Booking race conditions** - Multiple users booking same slot
3. **Payment edge cases** - Failed payments, retries
4. **Real-time messaging** - Connection drops, reconnects
5. **Image handling** - Large files, missing images
6. **Mobile UX** - Touch targets, gestures
7. **Offline handling** - PWA functionality

### Security Concerns:
1. RLS policies completeness
2. Input sanitization throughout
3. API rate limiting
4. Session management
5. Price validation server-side

---

## TEST EXECUTION LOG

| Date | Tester | Section | Pass | Fail | Notes |
|------|--------|---------|------|------|-------|
| | | | | | |

