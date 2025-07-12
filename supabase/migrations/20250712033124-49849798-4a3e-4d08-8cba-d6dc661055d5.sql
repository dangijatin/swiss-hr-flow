
-- Create leave types enum
CREATE TYPE public.leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency');

-- Create leave status enum  
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Create leave requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  leave_type leave_type NOT NULL DEFAULT 'annual',
  status leave_status NOT NULL DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  manager_comments TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave balances table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type, year)
);

-- Add manager_id to employees table for approver assignment
ALTER TABLE public.employees ADD COLUMN manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_requests
CREATE POLICY "Employees can view their own leave requests" 
  ON public.leave_requests 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can create their own leave requests" 
  ON public.leave_requests 
  FOR INSERT 
  WITH CHECK (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their pending leave requests" 
  ON public.leave_requests 
  FOR UPDATE 
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    ) AND status = 'pending'
  );

CREATE POLICY "Managers can view their team's leave requests" 
  ON public.leave_requests 
  FOR SELECT 
  USING (
    manager_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update leave request status" 
  ON public.leave_requests 
  FOR UPDATE 
  USING (
    manager_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for leave_balances
CREATE POLICY "Employees can view their own leave balances" 
  ON public.leave_balances 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view their team's leave balances" 
  ON public.leave_balances 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT e.id FROM public.employees e 
      JOIN public.employees m ON e.manager_id = m.id 
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage all leave balances" 
  ON public.leave_balances 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- Add update triggers
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at  
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate leave days (excluding weekends)
CREATE OR REPLACE FUNCTION public.calculate_leave_days(start_date DATE, end_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_days INTEGER := 0;
  current_date DATE := start_date;
BEGIN
  WHILE current_date <= end_date LOOP
    -- Only count weekdays (Monday=1 to Friday=5)
    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
      total_days := total_days + 1;
    END IF;
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN total_days;
END;
$$;

-- Trigger to automatically calculate days_requested
CREATE OR REPLACE FUNCTION public.set_leave_days()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.days_requested := public.calculate_leave_days(NEW.start_date, NEW.end_date);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_leave_days_trigger
  BEFORE INSERT OR UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_leave_days();
