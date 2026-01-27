-- Row Level Security Policies

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can only view themselves
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow Service Role to read all users (for AI operations)
CREATE POLICY "Service Role can read all users"
ON public.users FOR SELECT
USING (auth.role() = 'service_role');

-- ============================================================================
-- TODOS TABLE POLICIES
-- ============================================================================

-- Users can only view their own todos
CREATE POLICY "Users can view their own todos"
ON public.todos FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert todos
CREATE POLICY "Users can insert their own todos"
ON public.todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
CREATE POLICY "Users can update their own todos"
ON public.todos FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own todos
CREATE POLICY "Users can delete their own todos"
ON public.todos FOR DELETE
USING (auth.uid() = user_id);

-- Service Role can read all todos (for AI operations)
CREATE POLICY "Service Role can read all todos"
ON public.todos FOR SELECT
USING (auth.role() = 'service_role');

-- Service Role can perform CRUD on todos (for AI operations with user_id context)
CREATE POLICY "Service Role can manage all todos"
ON public.todos FOR ALL
USING (auth.role() = 'service_role');

-- ============================================================================
-- DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Users can only view their own documents
CREATE POLICY "Users can view their own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert documents
CREATE POLICY "Users can insert their own documents"
ON public.documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON public.documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON public.documents FOR DELETE
USING (auth.uid() = user_id);

-- Service Role can read all documents (for AI operations)
CREATE POLICY "Service Role can read all documents"
ON public.documents FOR SELECT
USING (auth.role() = 'service_role');

-- Service Role can perform CRUD on documents (for AI operations with user_id context)
CREATE POLICY "Service Role can manage all documents"
ON public.documents FOR ALL
USING (auth.role() = 'service_role');

-- ============================================================================
-- FILES TABLE POLICIES
-- ============================================================================

-- Users can only view their own files
CREATE POLICY "Users can view their own files"
ON public.files FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert files
CREATE POLICY "Users can insert their own files"
ON public.files FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update their own files"
ON public.files FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON public.files FOR DELETE
USING (auth.uid() = user_id);

-- Service Role can read all files
CREATE POLICY "Service Role can read all files"
ON public.files FOR SELECT
USING (auth.role() = 'service_role');

-- Service Role can perform CRUD on files
CREATE POLICY "Service Role can manage all files"
ON public.files FOR ALL
USING (auth.role() = 'service_role');

-- ============================================================================
-- AI_LOGS TABLE POLICIES
-- ============================================================================

-- Users can only view their own AI logs
CREATE POLICY "Users can view their own AI logs"
ON public.ai_logs FOR SELECT
USING (auth.uid() = user_id);

-- Service Role can insert logs (for all users)
CREATE POLICY "Service Role can insert AI logs"
ON public.ai_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Service Role can read all logs (for audit purposes)
CREATE POLICY "Service Role can read all AI logs"
ON public.ai_logs FOR SELECT
USING (auth.role() = 'service_role');

-- ============================================================================
-- ROLES TABLE POLICIES
-- ============================================================================

-- Everyone can read roles (read-only reference data)
CREATE POLICY "Everyone can read roles"
ON public.roles FOR SELECT
USING (true);
