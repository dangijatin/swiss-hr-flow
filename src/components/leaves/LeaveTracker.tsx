
import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaveBalance {
  id: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency';
  total_days: number;
  used_days: number;
  year: number;
}

export default function LeaveTracker() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveBalances();
  }, []);

  const fetchLeaveBalances = async () => {
    setLoading(true);
    
    const { data: currentEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (currentEmployee) {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', currentEmployee.id)
        .eq('year', new Date().getFullYear());

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leave balances",
          variant: "destructive"
        });
      } else {
        setBalances(data || []);
      }
    }
    setLoading(false);
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'annual': return Calendar;
      case 'sick': return Clock;
      default: return CheckCircle;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'sick': return 'text-red-600 bg-red-50 border-red-200';
      case 'personal': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'maternity': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'paternity': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'emergency': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="swiss-card">
        <h3 className="text-swiss-h3 mb-4">Leave Balance</h3>
        <div className="text-center py-8">
          <p className="text-swiss-body">Loading leave balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swiss-card">
      <h3 className="text-swiss-h3 mb-4">Leave Balance ({new Date().getFullYear()})</h3>
      
      {balances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-swiss-body">No leave balances configured. Contact HR to set up your leave entitlements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((balance) => {
            const IconComponent = getLeaveTypeIcon(balance.leave_type);
            const remaining = balance.total_days - balance.used_days;
            const usagePercentage = balance.total_days > 0 ? (balance.used_days / balance.total_days) * 100 : 0;
            
            return (
              <div 
                key={balance.id} 
                className={`border rounded-lg p-4 ${getLeaveTypeColor(balance.leave_type)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent size={16} />
                    <span className="font-medium capitalize">
                      {balance.leave_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {remaining}/{balance.total_days}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {balance.used_days} days</span>
                    <span>Remaining: {remaining} days</span>
                  </div>
                  
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div 
                      className="bg-current h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
