-- 1. Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to guarantee no stray or duplicate policies exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own symptom history" ON public.symptom_history;
DROP POLICY IF EXISTS "Users can insert own symptom history" ON public.symptom_history;
DROP POLICY IF EXISTS "Users can update own symptom history" ON public.symptom_history;
DROP POLICY IF EXISTS "Users can delete own symptom history" ON public.symptom_history;

DROP POLICY IF EXISTS "Users can view own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can insert own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can update own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can delete own health metrics" ON public.health_metrics;

DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON public.chat_sessions;

-- 3. Create fresh, audited RLS policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create fresh, audited RLS policies for symptom_history
CREATE POLICY "symptom_history_select_policy" ON public.symptom_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "symptom_history_insert_policy" ON public.symptom_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "symptom_history_update_policy" ON public.symptom_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "symptom_history_delete_policy" ON public.symptom_history
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create fresh, audited RLS policies for health_metrics
CREATE POLICY "health_metrics_select_policy" ON public.health_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "health_metrics_insert_policy" ON public.health_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_metrics_update_policy" ON public.health_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "health_metrics_delete_policy" ON public.health_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create fresh, audited RLS policies for chat_sessions
CREATE POLICY "chat_sessions_select_policy" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions_insert_policy" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_sessions_update_policy" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions_delete_policy" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);
