import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  department_id: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    position_id: '',
    employee_type: 'onsite_full_time' as const
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchPositions(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive"
      });
    } else {
      setDepartments(data || []);
    }
  };

  const fetchPositions = async (departmentId: string) => {
    const { data, error } = await supabase
      .from('positions')
      .select('id, title, department_id')
      .eq('department_id', departmentId)
      .order('title');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive"
      });
    } else {
      setPositions(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position_id) {
      toast({
        title: "Error",
        description: "Please select a position",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('employees')
      .insert([formData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Employee added successfully"
      });
      onSuccess();
      handleClose();
    }
    setLoading(false);
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      position_id: '',
      employee_type: 'onsite_full_time'
    });
    setSelectedDepartment('');
    setPositions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="swiss-card max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-swiss-h3">Add New Employee</h3>
          <button onClick={handleClose} className="btn-ghost p-2">
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="input-swiss" 
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              className="input-swiss" 
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select 
              className="input-swiss"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <select 
              className="input-swiss"
              value={formData.position_id}
              onChange={(e) => setFormData({...formData, position_id: e.target.value})}
              required
              disabled={!selectedDepartment}
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Work Type</label>
            <select 
              className="input-swiss"
              value={formData.employee_type}
              onChange={(e) => setFormData({...formData, employee_type: e.target.value as any})}
            >
              <option value="onsite_full_time">Onsite Full Time</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={loading}
            >
              <Plus size={16} className="mr-2" />
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
            <button 
              type="button" 
              onClick={handleClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}