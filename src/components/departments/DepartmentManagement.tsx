import { useState, useEffect } from 'react';
import { Plus, Users, UserCheck, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
  description: string;
  teamLeader?: string;
  employeeCount: number;
  color: string;
}

interface DepartmentManagementProps {
  trainingMode?: boolean;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical architecture',
    teamLeader: 'Sarah Chen',
    employeeCount: 12,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Design',
    description: 'User experience and visual design',
    teamLeader: 'Emma Rodriguez',
    employeeCount: 6,
    color: 'bg-purple-500'
  },
  {
    id: '3',
    name: 'Product',
    description: 'Product strategy and management',
    teamLeader: 'Alex Kim',
    employeeCount: 4,
    color: 'bg-green-500'
  },
  {
    id: '4',
    name: 'Analytics',
    description: 'Data analysis and business intelligence',
    teamLeader: 'Michael Torres',
    employeeCount: 8,
    color: 'bg-orange-500'
  },
  {
    id: '5',
    name: 'Sales',
    description: 'Customer acquisition and revenue growth',
    employeeCount: 15,
    color: 'bg-red-500'
  },
  {
    id: '6',
    name: 'Marketing',
    description: 'Brand awareness and customer engagement',
    employeeCount: 7,
    color: 'bg-pink-500'
  }
];

function DepartmentCard({ 
  department, 
  onEdit, 
  onDelete, 
  trainingMode 
}: { 
  department: Department; 
  onEdit: () => void; 
  onDelete: () => void;
  trainingMode?: boolean;
}) {
  return (
    <div className="swiss-card group relative">
      {trainingMode && department.id === '1' && (
        <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
          🏢 Department info
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${department.color}`} />
          <div>
            <h3 className="text-swiss-h3">{department.name}</h3>
            <p className="text-swiss-body">{department.description}</p>
          </div>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button onClick={onEdit} className="btn-ghost p-2">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="btn-ghost p-2 text-destructive hover:bg-destructive/10">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-swiss-body">
          <Users size={14} />
          <span>{department.employeeCount} employees</span>
        </div>
        
        {department.teamLeader && (
          <div className="flex items-center gap-2 text-swiss-body">
            <UserCheck size={14} />
            <span>Led by {department.teamLeader}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="text-primary text-sm hover:underline">
          View Team Members
        </button>
      </div>
    </div>
  );
}

export default function DepartmentManagement({ trainingMode }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive"
      });
    } else {
      // Transform data to match interface
      const transformedData = (data || []).map(dept => ({
        ...dept,
        employeeCount: 0, // TODO: Calculate from employees table
        teamLeader: undefined, // TODO: Get from positions/employees
        color: `bg-${['blue', 'purple', 'green', 'orange', 'red', 'pink'][Math.floor(Math.random() * 6)]}-500`
      }));
      setDepartments(transformedData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDept) {
        const { error } = await supabase
          .from('departments')
          .update(formData)
          .eq('id', editingDept.id);

        if (error) throw error;
        toast({ title: "Success", description: "Department updated successfully" });
      } else {
        const { error } = await supabase
          .from('departments')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Department created successfully" });
      }

      fetchDepartments();
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingDept ? "Failed to update department" : "Failed to create department",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleEdit = (department: Department) => {
    setEditingDept(department);
    setFormData({
      name: department.name,
      description: department.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Department deleted successfully" });
      fetchDepartments();
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingDept(null);
    setFormData({ name: '', description: '' });
  };

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Departments</h1>
          <p className="text-swiss-body mt-1">
            {departments.length} departments • {totalEmployees} total employees
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Add Department
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="swiss-card text-center">
          <div className="text-swiss-h2 text-primary">{departments.length}</div>
          <div className="text-swiss-body">Departments</div>
        </div>
        <div className="swiss-card text-center">
          <div className="text-swiss-h2 text-success">{totalEmployees}</div>
          <div className="text-swiss-body">Total Staff</div>
        </div>
        <div className="swiss-card text-center">
          <div className="text-swiss-h2 text-orange-500">
            {departments.filter(d => d.teamLeader).length}
          </div>
          <div className="text-swiss-body">With Leaders</div>
        </div>
        <div className="swiss-card text-center">
          <div className="text-swiss-h2 text-purple-500">
            {Math.round(totalEmployees / departments.length)}
          </div>
          <div className="text-swiss-body">Avg per Dept</div>
        </div>
      </div>

      {/* Department Grid */}
      <div className="swiss-grid">
        {departments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            onEdit={() => handleEdit(department)}
            onDelete={() => handleDelete(department.id)}
            trainingMode={trainingMode}
          />
        ))}
      </div>

      {/* Add Department Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="swiss-card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-swiss-h3">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button onClick={handleCloseForm} className="btn-ghost p-2">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name</label>
                <input 
                  type="text" 
                  required
                  className="input-swiss" 
                  placeholder="e.g., Human Resources"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="input-swiss" 
                  rows={3} 
                  placeholder="Brief description of the department"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingDept ? 'Update Department' : 'Create Department')}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}