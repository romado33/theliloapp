import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { ChatConversation } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: ChatConversation[];
  onSelectConversation: (conversationId: string) => void;
  loading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  loading,
}) => {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-muted-foreground">
          Messages from hosts and guests will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        const otherParticipant = user?.id === conversation.guest_id 
          ? conversation.host_name 
          : conversation.guest_name;
        
        const isHost = user?.id === conversation.host_id;

        return (
          <Card
            key={conversation.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{otherParticipant}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={isHost ? 'default' : 'secondary'} className="text-xs">
                        {isHost ? 'Host' : 'Guest'}
                      </Badge>
                      {conversation.unread_count && conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {conversation.experience_title && (
                    <p className="text-sm text-muted-foreground mb-1 truncate">
                      Re: {conversation.experience_title}
                    </p>
                  )}
                  
                  {conversation.last_message && (
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {conversation.last_message}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationList;