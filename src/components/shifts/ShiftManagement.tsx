import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface ShiftManagementProps {
  trainingMode?: boolean;
}

export default function ShiftManagement({ trainingMode }: ShiftManagementProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('start_time');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shifts",
        variant: "destructive"
      });
    } else {
      setShifts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingShift) {
        const { error } = await supabase
          .from('shifts')
          .update(formData)
          .eq('id', editingShift.id);

        if (error) throw error;
        toast({ title: "Success", description: "Shift updated successfully" });
      } else {
        const { error } = await supabase
          .from('shifts')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Shift created successfully" });
      }

      fetchShifts();
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingShift ? "Failed to update shift" : "Failed to create shift",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time
    });
    setShowAddForm(true);
  };

  const handleDelete = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Shift deleted successfully" });
      fetchShifts();
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingShift(null);
    setFormData({ name: '', start_time: '', end_time: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Shifts & Schedules</h1>
          <p className="text-swiss-body mt-1">
            {shifts.length} shifts configured
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Add Shift
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="swiss-grid">
        {shifts.map((shift) => (
          <div key={shift.id} className="swiss-card group relative">
            {trainingMode && shift === shifts[0] && (
              <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
                ⏰ Shift template
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-swiss-h3">{shift.name}</h3>
                  <p className="text-swiss-body">
                    {shift.start_time} - {shift.end_time}
                  </p>
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={() => handleEdit(shift)} 
                  className="btn-ghost p-2"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(shift.id)} 
                  className="btn-ghost p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Duration: {(() => {
                  const start = new Date(`2000-01-01T${shift.start_time}`);
                  const end = new Date(`2000-01-01T${shift.end_time}`);
                  const diff = end.getTime() - start.getTime();
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  return `${hours} hours`;
                })()}
              </p>
            </div>
          </div>
        ))}

        {shifts.length === 0 && (
          <div className="swiss-card col-span-full text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-swiss-h3 mb-2">No shifts configured</h3>
            <p className="text-swiss-body mb-4">Create your first shift template to get started</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus size={16} className="mr-2" />
              Add First Shift
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Shift Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="swiss-card max-w-md w-full">
            <h3 className="text-swiss-h3 mb-4">
              {editingShift ? 'Edit Shift' : 'Add New Shift'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shift Name</label>
                <input 
                  type="text" 
                  required
                  className="input-swiss" 
                  placeholder="e.g., Morning Shift"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input 
                  type="time" 
                  required
                  className="input-swiss"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input 
                  type="time" 
                  required
                  className="input-swiss"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingShift ? 'Update Shift' : 'Create Shift')}
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