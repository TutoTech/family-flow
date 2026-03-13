-- Migration for ordering tasks feature
ALTER TABLE public.task_templates 
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Optionally, you can set the initial display_order to match the created_at order if you want
-- but default 0 is fine since new tasks will naturally just appear.
WITH numbered_templates AS (
    SELECT id, ROW_NUMBER() OVER(PARTITION BY family_id ORDER BY created_at ASC) as row_num
    FROM public.task_templates
)
UPDATE public.task_templates 
SET display_order = numbered_templates.row_num
FROM numbered_templates
WHERE task_templates.id = numbered_templates.id;
