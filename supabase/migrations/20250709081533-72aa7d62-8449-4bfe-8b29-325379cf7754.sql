-- Create enums for better data consistency
CREATE TYPE public.employee_type AS ENUM ('onsite_full_time', 'hybrid', 'remote');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'half_day', 'late', 'early_leave');

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create positions table
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(title, department_id)
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  employee_type public.employee_type NOT NULL DEFAULT 'onsite_full_time',
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shifts table
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_positions_department_id ON public.positions(department_id);
CREATE INDEX idx_employees_position_id ON public.employees(position_id);
CREATE INDEX idx_employees_email ON public.employees(email);
CREATE INDEX idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_employee_date ON public.attendance(employee_id, date);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, can be restricted later with authentication)
CREATE POLICY "Allow all operations on departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on positions" ON public.positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for development
INSERT INTO public.departments (name, description) VALUES
  ('Engineering', 'Software development and technical operations'),
  ('Human Resources', 'People operations and talent management'),
  ('Marketing', 'Brand, content, and growth marketing'),
  ('Sales', 'Business development and customer acquisition');

INSERT INTO public.positions (title, department_id) VALUES
  ('Frontend Developer', (SELECT id FROM public.departments WHERE name = 'Engineering')),
  ('Backend Developer', (SELECT id FROM public.departments WHERE name = 'Engineering')),
  ('HR Manager', (SELECT id FROM public.departments WHERE name = 'Human Resources')),
  ('Marketing Manager', (SELECT id FROM public.departments WHERE name = 'Marketing')),
  ('Sales Representative', (SELECT id FROM public.departments WHERE name = 'Sales'));

INSERT INTO public.shifts (name, start_time, end_time) VALUES
  ('Day Shift', '09:00:00', '17:00:00'),
  ('Night Shift', '21:00:00', '05:00:00'),
  ('Flexible', '08:00:00', '16:00:00');

INSERT INTO public.employees (full_name, email, employee_type, position_id) VALUES
  ('Alice Johnson', 'alice@company.com', 'onsite_full_time', (SELECT id FROM public.positions WHERE title = 'Frontend Developer')),
  ('Bob Smith', 'bob@company.com', 'hybrid', (SELECT id FROM public.positions WHERE title = 'Backend Developer')),
  ('Carol Williams', 'carol@company.com', 'remote', (SELECT id FROM public.positions WHERE title = 'Marketing Manager')),
  ('David Brown', 'david@company.com', 'onsite_full_time', (SELECT id FROM public.positions WHERE title = 'HR Manager'));