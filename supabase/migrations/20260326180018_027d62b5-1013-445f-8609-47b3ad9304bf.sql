
-- Messages table for persistent session chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Session participants can view messages
CREATE POLICY "Session participants can view messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = messages.session_id
    AND (s.tutor_id = auth.uid() OR s.learner_id = auth.uid())
  )
);

-- Session participants can send messages
CREATE POLICY "Session participants can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = messages.session_id
    AND (s.tutor_id = auth.uid() OR s.learner_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
