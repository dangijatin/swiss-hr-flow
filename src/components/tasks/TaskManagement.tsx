import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
    position?: {
      title: string;
    };
  };
}

interface TaskManagementProps {
  trainingMode?: boolean;
}

export default function TaskManagement({ trainingMode }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assigned_to: string;
    due_date: string;
  }>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        employees(
          full_name,
          positions(title)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } else {
      setTasks(data || []);
    }
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, positions(title)')
      .order('full_name');

    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null
      };

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
        toast({ title: "Success", description: "Task updated successfully" });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;
        toast({ title: "Success", description: "Task created successfully" });
      }

      fetchTasks();
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingTask ? "Failed to update task" : "Failed to create task",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Task deleted successfully" });
      fetchTasks();
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assigned_to: '',
      due_date: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-warning" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'in_progress': return 'bg-warning/10 text-warning border-warning/20';
      case 'pending': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const taskStats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    total: tasks.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Tasks</h1>
          <p className="text-swiss-body mt-1">Assign and track task progress</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Add Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{taskStats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{taskStats.in_progress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>

        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{taskStats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{taskStats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="swiss-grid">
        {tasks.map((task) => (
          <div key={task.id} className="swiss-card group relative">
            {trainingMode && task === tasks[0] && (
              <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
                ✅ Task card
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-swiss-h3 mb-1">{task.title}</h3>
                {task.description && (
                  <p className="text-swiss-body text-sm line-clamp-2">{task.description}</p>
                )}
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                <button 
                  onClick={() => handleEdit(task)} 
                  className="btn-ghost p-2"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(task.id)} 
                  className="btn-ghost p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-sm">
                  {(task as any).employees?.full_name || 'Unassigned'}
                </span>
              </div>

              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-sm">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              {getStatusIcon(task.status)}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="swiss-card col-span-full text-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-swiss-h3 mb-2">No tasks yet</h3>
            <p className="text-swiss-body mb-4">Create your first task to get started</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus size={16} className="mr-2" />
              Add First Task
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="swiss-card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-swiss-h3 mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  className="input-swiss" 
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="input-swiss min-h-[80px]" 
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input-swiss"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="input-swiss"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select
                  className="input-swiss"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input 
                  type="date" 
                  className="input-swiss"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
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