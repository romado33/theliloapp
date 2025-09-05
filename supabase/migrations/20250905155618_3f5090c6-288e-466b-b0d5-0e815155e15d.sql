-- Create conversations table for messaging between guests and hosts
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique conversation per guest-host-experience combination
  UNIQUE(guest_id, host_id, experience_id)
);

-- Enable RLS on chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Add check to ensure content is not empty
  CONSTRAINT chat_message_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Enable RLS on chat_messages  
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_chat_conversations_guest_id ON public.chat_conversations(guest_id);
CREATE INDEX idx_chat_conversations_host_id ON public.chat_conversations(host_id);
CREATE INDEX idx_chat_conversations_experience_id ON public.chat_conversations(experience_id);
CREATE INDEX idx_chat_conversations_updated_at ON public.chat_conversations(updated_at DESC);

CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Create trigger to update conversation updated_at when a message is sent
CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_conversation_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_conversation_updated_at();

-- RLS Policies for chat_conversations
-- Users can view conversations they are part of (either as guest or host)
CREATE POLICY "Users can view their chat conversations"
ON public.chat_conversations
FOR SELECT
USING (
  auth.uid() = guest_id OR auth.uid() = host_id
);

-- Users can create conversations as guests
CREATE POLICY "Guests can create chat conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (
  auth.uid() = guest_id
);

-- Users can update conversations they are part of
CREATE POLICY "Users can update their chat conversations"
ON public.chat_conversations
FOR UPDATE
USING (
  auth.uid() = guest_id OR auth.uid() = host_id
);

-- RLS Policies for chat_messages
-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view chat messages in their conversations"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id 
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  )
);

-- Users can create messages in conversations they are part of
CREATE POLICY "Users can create chat messages in their conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id 
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  )
  AND auth.uid() = sender_id
);

-- Users can update messages in their conversations (for read receipts)
CREATE POLICY "Users can update chat messages in their conversations"
ON public.chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id 
    AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
  )
);