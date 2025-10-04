import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface ChatConversation {
  id: string;
  experience_id?: string;
  guest_id: string;
  host_id: string;
  created_at: string;
  updated_at: string;
  guest_name?: string;
  host_name?: string;
  experience_title?: string;
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender_name?: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) {
      console.log('No user, skipping conversation fetch');
      setLoading(false);
      return;
    }

    console.log('Fetching conversations for user:', user.id);

    try {
      // First get conversations without joins
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error in initial conversation query:', error);
        throw error;
      }
      
      console.log('Conversations found:', conversations?.length || 0);
      
      // If no conversations, just return empty
      if (!conversations || conversations.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      // Fetch related data separately for each conversation
      const conversationsWithData = await Promise.all(
        conversations.map(async (conv: any) => {
          try {
            // Fetch profiles
            const { data: guestProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', conv.guest_id)
              .maybeSingle();
            
            const { data: hostProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', conv.host_id)
              .maybeSingle();
            
            // Fetch experience if exists
            let experienceTitle = undefined;
            if (conv.experience_id) {
              const { data: experience } = await supabase
                .from('experiences')
                .select('title')
                .eq('id', conv.experience_id)
                .maybeSingle();
              experienceTitle = experience?.title;
            }
            
            return {
              id: conv.id,
              experience_id: conv.experience_id,
              guest_id: conv.guest_id,
              host_id: conv.host_id,
              created_at: conv.created_at,
              updated_at: conv.updated_at,
              guest_name: guestProfile 
                ? `${guestProfile.first_name || ''} ${guestProfile.last_name || ''}`.trim() 
                : 'Guest',
              host_name: hostProfile 
                ? `${hostProfile.first_name || ''} ${hostProfile.last_name || ''}`.trim() 
                : 'Host',
              experience_title: experienceTitle,
            };
          } catch (err) {
            console.error('Error fetching conversation data:', err);
            return null;
          }
        })
      );

      // Filter out any failed fetches
      const validConversations = conversationsWithData.filter(c => c !== null) as ChatConversation[];
      setConversations(validConversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      // Don't show toast for "no rows" or relationship errors
      if (error?.code !== 'PGRST116' && error?.code !== 'PGRST200') {
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      }
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!messages || messages.length === 0) {
        setMessages([]);
        return;
      }
      
      // Fetch sender profiles separately
      const messagesWithSenders = await Promise.all(
        messages.map(async (msg: any) => {
          try {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', msg.sender_id)
              .maybeSingle();
            
            return {
              id: msg.id,
              conversation_id: msg.conversation_id,
              sender_id: msg.sender_id,
              content: msg.content,
              created_at: msg.created_at,
              read_at: msg.read_at,
              sender_name: senderProfile 
                ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
                : 'User',
            };
          } catch (err) {
            console.error('Error fetching sender profile:', err);
            return null;
          }
        })
      );

      const validMessages = messagesWithSenders.filter(m => m !== null) as ChatMessage[];
      setMessages(validMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
      setMessages([]);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Create a new conversation
  const createConversation = async (hostId: string, guestId: string, experienceId?: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          host_id: hostId,
          guest_id: guestId,
          experience_id: experienceId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `or(guest_id.eq.${user.id},host_id.eq.${user.id})`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to message changes
    const messageChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as any;
            if (newMessage.conversation_id === activeConversationId) {
              fetchMessages(activeConversationId);
            }
            fetchConversations(); // Update last message in conversation list
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user, activeConversationId]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  return {
    conversations,
    messages,
    loading,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    createConversation,
    markAsRead,
  };
};