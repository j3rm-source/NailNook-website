-- Rename bullmq_job_ids to qstash_message_ids to reflect the actual queue provider
ALTER TABLE public.sms_sequences RENAME COLUMN bullmq_job_ids TO qstash_message_ids;
