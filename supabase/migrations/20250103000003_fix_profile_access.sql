-- Fix profile access and auto-creation
-- This migration addresses the "Anonymous" profile issue

-- 2a) Auto-create profile rows on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    full_name, 
    avatar_url, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1), -- crude username default
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2b) Loosen read policy for profiles
-- Allow authenticated users to read basic profile fields
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Create comprehensive policies
-- Allow all authenticated users to read basic profile info
CREATE POLICY "profiles_read_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to update their own profiles
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profiles (backup for trigger failure)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profiles
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- 2c) Backfill missing profiles (one-off)
-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (
  id, 
  email, 
  username, 
  full_name, 
  created_at, 
  updated_at
)
SELECT 
  u.id,
  u.email,
  split_part(u.email, '@', 1),
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Add index for better performance on username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- Ensure last_level_up column exists and is nullable for online user ordering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_level_up'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_level_up timestamptz;
  END IF;
END $$;