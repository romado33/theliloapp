/**
 * Calendar export utility for booking events
 * Supports Google Calendar and ICS file download (Apple Calendar, Outlook, etc.)
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  hostName?: string;
  bookingId?: string;
}

/**
 * Generate a Google Calendar URL for the event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate ICS file content for the event
 */
export function generateICSContent(event: CalendarEvent): string {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1) + 'Z';
  };

  const escapeICS = (text: string) => {
    return text.replace(/[\\;,\n]/g, (match) => {
      switch (match) {
        case '\\': return '\\\\';
        case ';': return '\\;';
        case ',': return '\\,';
        case '\n': return '\\n';
        default: return match;
      }
    });
  };

  const uid = `${event.bookingId || Date.now()}@livelocal.app`;
  const now = formatICSDate(new Date());

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Live Local//Experience Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatICSDate(event.startDate)}
DTEND:${formatICSDate(event.endDate)}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.description)}
LOCATION:${escapeICS(event.location)}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

/**
 * Download ICS file for Apple Calendar, Outlook, etc.
 */
export function downloadICSFile(event: CalendarEvent): void {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open Google Calendar with the event
 */
export function openGoogleCalendar(event: CalendarEvent): void {
  window.open(generateGoogleCalendarUrl(event), '_blank');
}

/**
 * Create calendar event from booking data
 */
export function createCalendarEventFromBooking(
  booking: {
    id: string;
    booking_date: string;
    guest_count: number;
    special_requests?: string | null;
    experience: {
      title: string;
      location: string;
      duration_hours?: number;
      description?: string | null;
    };
    host_profile?: {
      first_name?: string | null;
      last_name?: string | null;
    };
  }
): CalendarEvent {
  const startDate = new Date(booking.booking_date);
  const durationHours = booking.experience.duration_hours || 2; // Default 2 hours
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  
  const hostName = booking.host_profile 
    ? `${booking.host_profile.first_name || ''} ${booking.host_profile.last_name || ''}`.trim()
    : 'Your Host';

  const description = [
    `Experience: ${booking.experience.title}`,
    `Host: ${hostName}`,
    `Guests: ${booking.guest_count}`,
    booking.special_requests ? `Special Requests: ${booking.special_requests}` : '',
    '',
    booking.experience.description || '',
    '',
    `Booking ID: ${booking.id}`,
  ].filter(Boolean).join('\n');

  return {
    title: booking.experience.title,
    description,
    location: booking.experience.location,
    startDate,
    endDate,
    hostName,
    bookingId: booking.id,
  };
}
