import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addHours, startOfDay } from 'date-fns';

interface Experience {
  id: string;
  title: string;
  duration_hours: number;
}

interface AvailabilitySlot {
  id: string;
  experience_id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  is_available: boolean;
  experience: {
    title: string;
    duration_hours: number;
  };
}

export const AvailabilityCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    spots: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchExperiences();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('id, title, duration_hours')
        .eq('host_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedDate) return;

    try {
      const startOfSelectedDate = startOfDay(selectedDate);
      const endOfSelectedDate = addHours(startOfSelectedDate, 24);

      const { data, error } = await supabase
        .from('availability')
        .select(`
          *,
          experience:experiences(title, duration_hours)
        `)
        .gte('start_time', startOfSelectedDate.toISOString())
        .lt('start_time', endOfSelectedDate.toISOString())
        .order('start_time');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const addAvailabilitySlot = async () => {
    if (!selectedDate || !selectedExperience || !newSlot.startTime) {
      toast({
        title: "Error",
        description: "Please select a date, experience, and time",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const selectedExp = experiences.find(exp => exp.id === selectedExperience);
      if (!selectedExp) return;

      const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${newSlot.startTime}`);
      const endDateTime = addHours(startDateTime, selectedExp.duration_hours);

      const { error } = await supabase
        .from('availability')
        .insert({
          experience_id: selectedExperience,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          available_spots: newSlot.spots,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability slot added successfully"
      });

      setNewSlot({ startTime: '', spots: 1 });
      setSelectedExperience('');
      fetchAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeAvailabilitySlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability slot removed"
      });

      fetchAvailability();
    } catch (error) {
      console.error('Error removing availability:', error);
      toast({
        title: "Error",
        description: "Failed to remove availability slot",
        variant: "destructive"
      });
    }
  };

  const toggleSlotAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('availability')
        .update({ is_available: !currentStatus })
        .eq('id', slotId);

      if (error) throw error;

      fetchAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Manage Your Availability</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Label className="text-base font-medium">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mt-2"
                disabled={(date) => date < new Date()}
              />
            </div>

            {/* Add New Slot */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Add Availability Slot</Label>
              
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experiences.map((exp) => (
                      <SelectItem key={exp.id} value={exp.id}>
                        {exp.title} ({exp.duration_hours}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="spots">Available Spots</Label>
                  <Input
                    id="spots"
                    type="number"
                    min="1"
                    value={newSlot.spots}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, spots: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <Button 
                onClick={addAvailabilitySlot} 
                disabled={loading}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability for Selected Date */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Availability for {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No availability slots for this date</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add time slots above to start accepting bookings
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availability.map((slot) => (
                  <div 
                    key={slot.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{slot.experience.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(parseISO(slot.start_time), 'h:mm a')} - {format(parseISO(slot.end_time), 'h:mm a')}
                          </span>
                        </span>
                        <span>{slot.available_spots} spots available</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={slot.is_available ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                      >
                        {slot.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAvailabilitySlot(slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};