/**
 * Utility functions for booking status management
 */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: BookingStatus): string => {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Awaiting Host Approval';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const getStatusBadgeVariant = (status: BookingStatus): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'completed':
      return 'default';
    default:
      return 'secondary';
  }
};

