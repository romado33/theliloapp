import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Home, ArrowLeftRight } from 'lucide-react';

interface RoleSwitcherProps {
  isHost: boolean;
  currentRole: 'user' | 'host';
  onRoleSwitch: (role: 'user' | 'host') => void;
}

export const RoleSwitcher = ({ isHost, currentRole, onRoleSwitch }: RoleSwitcherProps) => {
  // If user is not a host, don't show the switcher
  if (!isHost) return null;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={currentRole === 'user' ? 'default' : 'secondary'} className="text-xs">
        <User className="w-3 h-3 mr-1" />
        Guest
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRoleSwitch(currentRole === 'user' ? 'host' : 'user')}
        className="h-6 w-6 p-0"
      >
        <ArrowLeftRight className="w-3 h-3" />
      </Button>
      
      <Badge variant={currentRole === 'host' ? 'default' : 'secondary'} className="text-xs">
        <Home className="w-3 h-3 mr-1" />
        Host
      </Badge>
    </div>
  );
};