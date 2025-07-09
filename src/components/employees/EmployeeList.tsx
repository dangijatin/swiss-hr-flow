import { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  type: 'onsite' | 'hybrid' | 'remote';
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: string;
  startDate: string;
}

interface EmployeeListProps {
  trainingMode?: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    position: 'Senior Developer',
    department: 'Engineering',
    email: 'sarah.chen@company.com',
    phone: '+1 (555) 0123',
    type: 'hybrid',
    status: 'active',
    startDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Michael Torres',
    position: 'Data Analyst',
    department: 'Analytics',
    email: 'michael.torres@company.com',
    phone: '+1 (555) 0124',
    type: 'onsite',
    status: 'active',
    startDate: '2023-03-22'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    position: 'UX Designer',
    department: 'Design',
    email: 'emma.rodriguez@company.com',
    phone: '+1 (555) 0125',
    type: 'remote',
    status: 'active',
    startDate: '2024-01-08'
  },
  {
    id: '4',
    name: 'Alex Kim',
    position: 'Product Manager',
    department: 'Product',
    email: 'alex.kim@company.com',
    phone: '+1 (555) 0126',
    type: 'hybrid',
    status: 'on-leave',
    startDate: '2022-11-30'
  }
];

function EmployeeCard({ employee, onEdit, trainingMode }: { 
  employee: Employee; 
  onEdit: () => void;
  trainingMode?: boolean;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-blue-100 text-blue-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      case 'onsite': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'on-leave': return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive': return 'bg-destructive/10 text-destructive border-destructive/20';
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
              {employee.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-swiss-h3">{employee.name}</h3>
            <p className="text-swiss-body">{employee.position}</p>
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
          <Phone size={14} />
          <span>{employee.phone}</span>
        </div>
        
        <div className="flex items-center gap-2 text-swiss-body">
          <MapPin size={14} />
          <span className="capitalize">{employee.department}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex gap-2">
          <span className={cn(
            "px-2 py-1 text-xs rounded-full",
            getTypeColor(employee.type)
          )}>
            {employee.type}
          </span>
          <span className={cn(
            "px-2 py-1 text-xs rounded-full border",
            getStatusColor(employee.status)
          )}>
            {employee.status.replace('-', ' ')}
          </span>
        </div>
        
        <span className="text-xs text-muted-foreground">
          Started {new Date(employee.startDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default function EmployeeList({ trainingMode, onAddEmployee, onEditEmployee }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || employee.type === filterType;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Employees</h1>
          <p className="text-swiss-body mt-1">Manage your team members</p>
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
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-swiss"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="on-leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Grid */}
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

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-swiss-body">No employees found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}