-- Add manager_id field to employees table
ALTER TABLE public.employees 
ADD COLUMN manager_id uuid REFERENCES public.employees(id);

-- Add index for better performance
CREATE INDEX idx_employees_manager_id ON public.employees(manager_id);