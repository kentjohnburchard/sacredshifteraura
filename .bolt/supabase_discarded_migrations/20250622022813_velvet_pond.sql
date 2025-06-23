-- Create error logs table for application error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message text NOT NULL,
  error_stack text,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  location text,
  module_id text,
  operation text,
  additional_info jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolution_notes text
);

-- Create a view to see error frequency
CREATE OR REPLACE VIEW public.error_frequency AS
  SELECT 
    error_message,
    COUNT(*) as occurrence_count,
    MIN(timestamp) as first_occurrence,
    MAX(timestamp) as last_occurrence,
    ARRAY_AGG(DISTINCT module_id) as affected_modules
  FROM public.error_logs
  GROUP BY error_message
  ORDER BY COUNT(*) DESC;

-- Enable Row Level Security
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only system admins can see all errors
CREATE POLICY "Admins can view all errors"
  ON public.error_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'admin@sacredshifter.com'
    )
  );

-- Users can only see their own errors
CREATE POLICY "Users can see their own errors"
  ON public.error_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can insert errors
CREATE POLICY "Allow error submissions"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON public.error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_module_id_idx ON public.error_logs(module_id);