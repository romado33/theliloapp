import { useEffect } from 'react';

const TestingPlan = () => {
  useEffect(() => {
    document.title = 'Lilo Testing Plan';
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-4">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          h2 { page-break-after: avoid; }
          section { page-break-inside: avoid; }
        }
      `}</style>
      
      <div className="no-print mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800">
          <strong>To save as PDF:</strong> Press <kbd className="px-2 py-1 bg-blue-100 rounded">Ctrl+P</kbd> (or <kbd className="px-2 py-1 bg-blue-100 rounded">Cmd+P</kbd> on Mac) → Select "Save as PDF"
        </p>
      </div>

      <header className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold mb-2">Lilo App Testing Plan</h1>
        <p className="text-gray-600">Comprehensive QA Checklist for Production Readiness</p>
        <p className="text-sm text-gray-500 mt-2">Generated: {new Date().toLocaleDateString()}</p>
      </header>

      {/* Guest Features */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-800 border-b pb-2">1. Guest/Client Features</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.1 Authentication</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Sign up with email - password strength indicator shows</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Sign up with Google OAuth</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Sign in with existing credentials</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Sign out successfully</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Password reset flow works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Weak password rejected (less than 8 chars)</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.2 Browse & Search</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Homepage loads with featured experiences</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Category filter works correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Location search returns relevant results</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Price range filter works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Date picker filters available experiences</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Map view displays experience locations</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Advanced search with multiple filters</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.3 Experience Details</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Experience details page loads correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Image gallery/carousel works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Host profile information displayed</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Reviews section shows ratings & comments</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Social share buttons work (Facebook, Twitter, etc.)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Save to favorites works (logged in)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Report content button works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Contact Host button opens chat</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.4 Booking Flow</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Available time slots displayed correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Guest count selector works (respects max)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Total price calculates correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Special requests field accepts input</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Stripe checkout opens successfully</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Payment success redirects to confirmation</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Payment cancellation handled gracefully</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking confirmation email received</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Waitlist button appears when slots full</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Quick Book modal works from search results</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.5 User Dashboard</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Dashboard shows upcoming bookings</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Past bookings displayed in history</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Modify booking dialog works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Cancel booking works (within policy)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Calendar export (Google Calendar)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Calendar export (ICS download)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Saved experiences list works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Activity history shows recent actions</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.6 Reviews</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Write review button appears for completed bookings</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Star rating selection works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Review text submission works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Review appears on experience page</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Cannot review same booking twice</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.7 Messaging</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Messages page loads conversation list</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Can start new conversation with host</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Messages send successfully</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Real-time message updates work</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Unread message indicators show</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1.8 Notifications</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Notification bell shows unread count</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Notification dropdown lists recent notifications</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Mark as read works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Clicking notification navigates correctly</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Host Features */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-green-800 border-b pb-2">2. Host Features</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2.1 Host Onboarding</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">"Become a Host" button visible in navigation</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Host registration form submits successfully</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Profile updates to is_host = true</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Host dashboard becomes accessible</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Role switcher appears in header</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2.2 Experience Management</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Create new experience form works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">All required fields validated</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Photo upload works (multiple images)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Location/address geocoding works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Category selection works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">What's included list editable</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">What to bring list editable</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Edit existing experience works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Deactivate experience works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Experience status workflow (submitted → approved)</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2.3 Availability Management</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Availability calendar loads</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Add single time slot works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Add recurring availability works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Edit existing slot works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Delete slot works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Spots count configurable per slot</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booked slots show correctly</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2.4 Booking Management</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking list displays all bookings</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Filter by status works (pending/confirmed/etc.)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Accept booking works (pending → confirmed)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Decline booking works (pending → cancelled)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Mark complete works (confirmed → completed)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Guest contact info displayed</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Message guest button opens chat</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Email notifications sent on status change</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2.5 Revenue & Analytics</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Revenue chart displays correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Total earnings calculated correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking count accurate</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Date range filter works</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* General & Cross-Cutting */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-800 border-b pb-2">3. General & Cross-Cutting</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">3.1 Mobile & Responsive</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Homepage responsive on mobile (375px)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Navigation hamburger menu works</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Experience cards stack properly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking form usable on mobile</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Dashboard tables scroll horizontally</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Tablet layout works (768px)</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">3.2 PWA Features</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Install prompt appears (mobile Chrome)</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">App installable to home screen</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Offline page shows when disconnected</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Service worker caches assets</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">3.3 Legal & Compliance</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Privacy Policy page accessible</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Terms of Service page accessible</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Footer links work correctly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Contact information accurate</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">3.4 Error Handling</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left w-12">✓</th>
                <th className="border border-gray-300 p-2 text-left">Test Case</th>
                <th className="border border-gray-300 p-2 text-left w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">404 page displays for invalid routes</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Form validation errors show clearly</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Network error toasts appear</td><td className="border border-gray-300 p-2"></td></tr>
              <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Loading states show during fetches</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Email Notifications */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-orange-800 border-b pb-2">4. Email Notifications</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left w-12">✓</th>
              <th className="border border-gray-300 p-2 text-left">Trigger</th>
              <th className="border border-gray-300 p-2 text-left">Recipient</th>
              <th className="border border-gray-300 p-2 text-left w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking created</td><td className="border border-gray-300 p-2">Guest + Host</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking confirmed by host</td><td className="border border-gray-300 p-2">Guest</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking cancelled</td><td className="border border-gray-300 p-2">Guest + Host</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking modified</td><td className="border border-gray-300 p-2">Guest + Host</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Booking reminder (24h before)</td><td className="border border-gray-300 p-2">Guest</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Review request (after experience)</td><td className="border border-gray-300 p-2">Guest</td><td className="border border-gray-300 p-2"></td></tr>
          </tbody>
        </table>
      </section>

      {/* Stripe Integration */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800 border-b pb-2">5. Stripe Integration</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left w-12">✓</th>
              <th className="border border-gray-300 p-2 text-left">Test Case</th>
              <th className="border border-gray-300 p-2 text-left w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Test card (4242 4242 4242 4242) works</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Declined card shows error message</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Webhook receives payment events</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Subscription checkout works (if applicable)</td><td className="border border-gray-300 p-2"></td></tr>
            <tr><td className="border border-gray-300 p-2">☐</td><td className="border border-gray-300 p-2">Customer portal accessible</td><td className="border border-gray-300 p-2"></td></tr>
          </tbody>
        </table>
      </section>

      {/* Notes Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Notes & Issues</h2>
        <div className="border border-gray-300 p-4 min-h-[200px]">
          <p className="text-gray-400 text-sm">Use this space to document any issues found during testing...</p>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 pt-6 border-t">
        <p>Lilo Testing Plan • Page {'{page}'} of {'{pages}'}</p>
      </footer>
    </div>
  );
};

export default TestingPlan;
