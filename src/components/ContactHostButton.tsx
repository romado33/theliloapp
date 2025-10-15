import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ContactHostButtonProps {
  hostId: string;
  experienceId?: string;
  experienceTitle?: string;
  className?: string;
}

const ContactHostButton: React.FC<ContactHostButtonProps> = ({
  hostId,
  experienceId,
  experienceTitle,
  className,
}) => {
  const { user } = useAuth();
  const { createConversation } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContactHost = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === hostId) {
      toast({
        title: 'Cannot message yourself',
        description: 'You cannot start a conversation with yourself',
        variant: 'destructive',
      });
      return;
    }

    try {
      const conversationId = await createConversation(hostId, user.id, experienceId);
      if (conversationId) {
        navigate('/messages');
        toast({
          title: 'Conversation started',
          description: `You can now message the host${experienceTitle ? ` about "${experienceTitle}"` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleContactHost}
      variant="outline"
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Contact Host
    </Button>
  );
};

export default ContactHostButton;