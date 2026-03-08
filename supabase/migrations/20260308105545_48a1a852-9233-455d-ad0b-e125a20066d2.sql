
-- Add unique constraint for upsert on device_tokens
ALTER TABLE public.device_tokens ADD CONSTRAINT device_tokens_user_platform_unique UNIQUE (user_id, platform);
