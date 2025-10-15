// React handled by Vite
import { useChat } from '@/hooks/useChat';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ConversationList from '@/components/ConversationList';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Messages = () => {
  const auth = useSecureAuth();
  const {
    conversations,
    messages,
    loading,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
  } = useChat();

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  const handleSendMessage = async (content: string) => {
    if (activeConversationId) {
      await sendMessage(activeConversationId, content);
    }
  };

  const handleBackToList = () => {
    setActiveConversationId(null);
  };

  if (!auth.user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!activeConversationId ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with hosts and guests
            </p>
          </div>

          <ConversationList
            conversations={conversations}
            onSelectConversation={setActiveConversationId}
            loading={loading}
          />
        </>
      ) : (
        <div className="h-[calc(100vh-12rem)]">
          {activeConversation && (
            <ChatInterface
              conversation={activeConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={handleBackToList}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;