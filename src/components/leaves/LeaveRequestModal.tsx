
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeaveRequestModal({ isOpen, onClose, onSuccess }: LeaveRequestModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency'>('annual');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error", 
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current employee and their manager
      const { data: currentEmployee, error: employeeError } = await supabase
        .from('employees')
        .select('id, manager_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (employeeError || !currentEmployee) {
        throw new Error('Failed to get employee information');
      }

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: currentEmployee.id,
          manager_id: currentEmployee.manager_id,
          leave_type: leaveType,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          reason: reason.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave request submitted successfully"
      });

      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setLeaveType('annual');
      setReason('');
      onSuccess();

    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="input-swiss"
                required
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief reason for leave..."
                className="input-swiss"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => {
                  // Disable past dates and weekends
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0 || date.getDay() === 6;
                }}
                className="rounded-md border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => {
                  // Disable past dates, dates before start date, and weekends
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || 
                         (startDate && date < startDate) || 
                         date.getDay() === 0 || 
                         date.getDay() === 6;
                }}
                className="rounded-md border"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Duration:</strong> {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} calendar days
                (working days will be calculated automatically)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !startDate || !endDate}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
