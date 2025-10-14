import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Home } from 'lucide-react';

interface DevBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'user' | 'host') => void;
}

export const DevBypassModal = ({ isOpen, onClose, onSelectRole }: DevBypassModalProps) => {
  const handleRoleSelect = (role: 'user' | 'host') => {
    onSelectRole(role);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Your Dev Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Select which role you want to test as:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleRoleSelect('user')}
            >
              <User className="w-6 h-6" />
              <span>Guest User</span>
              <Badge variant="secondary" className="text-xs">
                Browse & Book
              </Badge>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => handleRoleSelect('host')}
            >
              <Home className="w-6 h-6" />
              <span>Host</span>
              <Badge variant="secondary" className="text-xs">
                Manage Experiences
              </Badge>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};