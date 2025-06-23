-- Create sync logs table for tracking data synchronization
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  data_type text,
  status text NOT NULL,
  details text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create access policies
CREATE POLICY "Users can insert their own sync logs"
  ON public.sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync logs"
  ON public.sync_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS sync_logs_user_id_idx ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS sync_logs_created_at_idx ON public.sync_logs(created_at);

-- Create a function to log sync activity
CREATE OR REPLACE FUNCTION public.log_sync_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.sync_logs (user_id, action, data_type, status, details)
  VALUES (
    NEW.user_id,
    TG_OP,  -- INSERT, UPDATE, or DELETE
    TG_TABLE_NAME,
    'success',
    'Automatic sync tracking'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger only if encrypted_data table exists (we check first to prevent errors)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encrypted_data') THEN
    -- Drop trigger if it exists to avoid errors
    DROP TRIGGER IF EXISTS log_encrypted_data_sync ON public.encrypted_data;
    
    -- Create the trigger
    CREATE TRIGGER log_encrypted_data_sync
    AFTER INSERT OR UPDATE OR DELETE ON public.encrypted_data
    FOR EACH ROW EXECUTE FUNCTION public.log_sync_activity();
  END IF;
END
$$;