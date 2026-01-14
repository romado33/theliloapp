import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Download } from 'lucide-react';
import { 
  createCalendarEventFromBooking, 
  openGoogleCalendar, 
  downloadICSFile 
} from '@/lib/calendarExport';
import { useToast } from '@/hooks/use-toast';

interface CalendarExportButtonProps {
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
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const CalendarExportButton = ({ 
  booking, 
  variant = 'outline',
  size = 'sm' 
}: CalendarExportButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleGoogleCalendar = () => {
    try {
      const event = createCalendarEventFromBooking(booking);
      openGoogleCalendar(event);
      toast({
        title: "Opening Google Calendar",
        description: "Add the event to your calendar"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to create calendar event",
        variant: "destructive"
      });
    }
    setOpen(false);
  };

  const handleICSDownload = () => {
    try {
      const event = createCalendarEventFromBooking(booking);
      downloadICSFile(event);
      toast({
        title: "Calendar file downloaded",
        description: "Open the file to add to your calendar"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to create calendar file",
        variant: "destructive"
      });
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1">
          <Calendar className="w-3 h-3" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19.5 4h-3V2.5a.5.5 0 0 0-1 0V4h-7V2.5a.5.5 0 0 0-1 0V4h-3A1.5 1.5 0 0 0 3 5.5v14A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-14A1.5 1.5 0 0 0 19.5 4zM20 19.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5V9h16v10.5z"/>
          </svg>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleICSDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download .ics (Apple/Outlook)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
