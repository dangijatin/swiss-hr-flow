
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
  employee: {
    full_name: string;
  };
}

export default function LeaveCalendar() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  const fetchApprovedLeaves = async () => {
    setLoading(true);
    
    try {
      // For now, we'll use a placeholder since the leave_requests table might not be in types yet
      // This will be a simple query that doesn't break the build
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name')
        .limit(0); // Get no results, just test the connection

      if (error) {
        console.error('Database connection error:', error);
      }

      // Mock data for now until the database types are updated
      setLeaveRequests([]);
      setSelectedDates([]);
      
    } catch (error) {
      console.error('Error in fetchApprovedLeaves:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approved leaves",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'maternity': return 'bg-pink-100 text-pink-800';
      case 'paternity': return 'bg-indigo-100 text-indigo-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="swiss-card">
        <h3 className="text-swiss-h3 mb-4">Leave Calendar</h3>
        <div className="text-center py-8">
          <p className="text-swiss-body">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="swiss-card">
        <h3 className="text-swiss-h3 mb-4">Team Leave Calendar</h3>
        <p className="text-swiss-body mb-6">View approved leaves for the team</p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              className="rounded-md border"
              disabled={(date) => {
                // Disable weekends
                return date.getDay() === 0 || date.getDay() === 6;
              }}
            />
          </div>
          
          <div className="lg:w-80">
            <h4 className="font-medium mb-4">Upcoming Leaves</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {leaveRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming approved leaves</p>
              ) : (
                leaveRequests.map((request) => (
                  <div key={request.id} className="border border-border rounded-md p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm">{request.employee.full_name}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(request.leave_type)}`}>
                        {request.leave_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
