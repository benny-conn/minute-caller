-- Credits table
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transactions table for tracking payment history
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Call history table for tracking calls
CREATE TABLE IF NOT EXISTS public.call_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    duration INTEGER,
    cost NUMERIC(10, 2),
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own credits
CREATE POLICY credits_select_policy ON public.credits
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to manage all credits
-- This allows our server functions to update credits
CREATE POLICY credits_all_policy ON public.credits
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create policy for users to view their own transactions
CREATE POLICY transactions_select_policy ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to insert transactions
CREATE POLICY transactions_insert_policy ON public.transactions
    FOR INSERT
    WITH CHECK (true);

-- Create policy for users to view their own call history
CREATE POLICY call_history_select_policy ON public.call_history
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to insert call history
CREATE POLICY call_history_insert_policy ON public.call_history
    FOR INSERT
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS credits_user_id_idx ON public.credits (user_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions (created_at);
CREATE INDEX IF NOT EXISTS call_history_user_id_idx ON public.call_history (user_id);
CREATE INDEX IF NOT EXISTS call_history_created_at_idx ON public.call_history (created_at);

-- Function to create credits table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_credits_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function is a placeholder since we've already created the table above
    -- It's called by the updateUserCredits function when the table doesn't exist
    RAISE NOTICE 'Credits table already exists';
END;
$$; 