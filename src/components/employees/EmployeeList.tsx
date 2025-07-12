
import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  employee_type: 'onsite_full_time' | 'hybrid' | 'remote';
  created_at: string;
  manager_id?: string;
  position?: {
    title: string;
    department?: {
      name: string;
    };
  };
  manager?: {
    full_name: string;
  };
}

interface EmployeeListProps {
  trainingMode?: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
}

function EmployeeCard({ employee, onEdit, trainingMode }: { 
  employee: Employee; 
  onEdit: () => void;
  trainingMode?: boolean;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-blue-100 text-blue-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      case 'onsite_full_time': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="swiss-card group relative">
      {trainingMode && employee.id === '1' && (
        <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
          👤 Employee details
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-medium text-lg">
              {employee.full_name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-swiss-h3">{employee.full_name}</h3>
            <p className="text-swiss-body">{employee.position?.title || 'No Position'}</p>
          </div>
        </div>
        
        <button 
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost p-2"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-swiss-body">
          <Mail size={14} />
          <span className="truncate">{employee.email}</span>
        </div>
        
        <div className="flex items-center gap-2 text-swiss-body">
          <MapPin size={14} />
          <span className="capitalize">{employee.position?.department?.name || 'No Department'}</span>
        </div>

        {employee.manager && (
          <div className="flex items-center gap-2 text-swiss-body">
            <User size={14} />
            <span className="truncate">Reports to: {employee.manager.full_name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex gap-2">
          <span className={cn(
            "px-2 py-1 text-xs rounded-full",
            getTypeColor(employee.employee_type)
          )}>
            {employee.employee_type.replace('_', ' ')}
          </span>
        </div>
        
        <span className="text-xs text-muted-foreground">
          Started {new Date(employee.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default function EmployeeList({ trainingMode, onAddEmployee, onEditEmployee }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        position:positions(
          title,
          department:departments(name)
        ),
        manager:employees!employees_manager_id_fkey(
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    } else {
      // Transform the data to match our Employee interface
      const transformedEmployees = data?.map(emp => ({
        ...emp,
        position: emp.position ? {
          title: emp.position.title,
          department: emp.position.department ? {
            name: emp.position.department.name
          } : undefined
        } : undefined,
        manager: Array.isArray(emp.manager) && emp.manager.length > 0 ? emp.manager[0] : undefined
      })) || [];
      
      setEmployees(transformedEmployees);
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.position?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.position?.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || employee.employee_type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Employees</h1>
          <p className="text-swiss-body mt-1">Manage your team members and their reporting structure</p>
        </div>
        
        <button onClick={onAddEmployee} className="btn-primary">
          <Plus size={16} className="mr-2" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-swiss pl-10"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-swiss"
        >
          <option value="all">All Types</option>
          <option value="onsite_full_time">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-swiss-body">Loading employees...</p>
        </div>
      ) : (
        <>
          <div className="swiss-grid">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={() => onEditEmployee(employee)}
                trainingMode={trainingMode}
              />
            ))}
          </div>

          {filteredEmployees.length === 0 && employees.length > 0 && (
            <div className="text-center py-12">
              <p className="text-swiss-body">No employees found matching your criteria.</p>
            </div>
          )}

          {employees.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-swiss-body">No employees yet. Add your first employee to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
