-- Circle messages enhancement to support direct messaging
CREATE TABLE IF NOT EXISTS public.circle_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  message_type text,
  is_system_message boolean DEFAULT false
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS circle_messages_pkey ON public.circle_messages(id);
CREATE INDEX IF NOT EXISTS idx_circle_messages_system ON public.circle_messages(is_system_message) 
  WHERE is_system_message = true;

-- Add direct message support to circles table
ALTER TABLE public.circles 
  ADD COLUMN IF NOT EXISTS is_direct_message boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS direct_message_participants uuid[];

-- Create indexes for direct messaging
CREATE INDEX IF NOT EXISTS idx_circles_direct_message ON public.circles(is_direct_message) 
  WHERE is_direct_message = true;
CREATE INDEX IF NOT EXISTS idx_circles_dm_participants ON public.circles 
  USING gin(direct_message_participants) WHERE is_direct_message = true;

-- Enable Row Level Security
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;

-- Circle participants can send messages
CREATE POLICY "Circle members can send messages"
  ON public.circle_messages
  FOR INSERT
  TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.circle_members 
    WHERE circle_members.circle_id = circle_messages.circle_id 
    AND circle_members.user_id = auth.uid()
  ) AND auth.uid() = user_id);

-- Messages are viewable by circle participants
CREATE POLICY "Messages are viewable by circle members"
  ON public.circle_messages
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM public.circle_members 
    WHERE circle_members.circle_id = circle_messages.circle_id 
    AND circle_members.user_id = auth.uid()
  ));

-- Direct message policies
CREATE POLICY "Direct message participants can send messages"
  ON public.circle_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.circles 
    WHERE circles.id = circle_messages.circle_id 
    AND circles.is_direct_message = true
    AND auth.uid() = ANY(circles.direct_message_participants)
  ) AND (auth.uid() = user_id OR is_system_message = true));

CREATE POLICY "Direct message participants can view messages"
  ON public.circle_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.circles 
    WHERE circles.id = circle_messages.circle_id 
    AND circles.is_direct_message = true
    AND auth.uid() = ANY(circles.direct_message_participants)
  ));

CREATE POLICY "Direct message participants can update their messages"
  ON public.circle_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.circles 
    WHERE circles.id = circle_messages.circle_id 
    AND circles.is_direct_message = true
    AND auth.uid() = ANY(circles.direct_message_participants)
  ))
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.circles 
    WHERE circles.id = circle_messages.circle_id 
    AND circles.is_direct_message = true
    AND auth.uid() = ANY(circles.direct_message_participants)
  ));
  
CREATE POLICY "Direct message participants can delete their messages"
  ON public.circle_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.circles 
    WHERE circles.id = circle_messages.circle_id 
    AND circles.is_direct_message = true
    AND auth.uid() = ANY(circles.direct_message_participants)
  ));