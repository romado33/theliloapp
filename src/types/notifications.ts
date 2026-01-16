import type { Json } from '@/integrations/supabase/types';

/**
 * Notification data payload types for different notification types
 */
export interface BookingNotificationData {
  booking_id?: string;
  experience_id?: string;
  experience_title?: string;
  booking_date?: string;
  guest_count?: number;
}

export interface MessageNotificationData {
  conversation_id?: string;
  sender_name?: string;
  message_preview?: string;
}

export interface ReviewNotificationData {
  review_id?: string;
  experience_id?: string;
  rating?: number;
}

export interface SystemNotificationData {
  action_url?: string;
  action_label?: string;
}

/**
 * Union type for all notification data types
 */
export type NotificationData = 
  | BookingNotificationData 
  | MessageNotificationData 
  | ReviewNotificationData 
  | SystemNotificationData
  | Record<string, unknown>;

/**
 * Notification interface with properly typed data field
 */
export interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'system' | string;
  title: string;
  message: string;
  data: NotificationData | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Helper to safely parse notification data from Json
 */
export const parseNotificationData = (data: Json | null): NotificationData | null => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  return data as NotificationData;
};
