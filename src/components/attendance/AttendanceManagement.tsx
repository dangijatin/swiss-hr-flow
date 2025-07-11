import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'early_leave';
  employee?: {
    full_name: string;
    position?: {
      title: string;
    };
  };
}

interface AttendanceManagementProps {
  trainingMode?: boolean;
}

export default function AttendanceManagement({ trainingMode }: AttendanceManagementProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employees!inner(
          full_name,
          positions(title)
        )
      `)
      .eq('date', selectedDate)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive"
      });
    } else {
      setAttendanceRecords(data || []);
    }
    setLoading(false);
  };

  const markAttendance = async (employeeId: string, status: string) => {
    const { error } = await supabase
      .from('attendance')
      .upsert({
        employee_id: employeeId,
        date: selectedDate,
        status,
        check_in: status === 'present' || status === 'late' ? new Date().toISOString() : null,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Attendance marked successfully" });
      fetchAttendanceRecords();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'absent': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'late': return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'half_day': return <Clock className="w-4 h-4 text-primary" />;
      case 'early_leave': return <Clock className="w-4 h-4 text-warning" />;
      default: return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success/10 text-success border-success/20';
      case 'absent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'late': return 'bg-warning/10 text-warning border-warning/20';
      case 'half_day': return 'bg-primary/10 text-primary border-primary/20';
      case 'early_leave': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const attendanceStats = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    total: attendanceRecords.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Attendance</h1>
          <p className="text-swiss-body mt-1">Track employee attendance and working hours</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-swiss"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attendanceStats.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </div>
        </div>

        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attendanceStats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>
        </div>

        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attendanceStats.late}</p>
              <p className="text-sm text-muted-foreground">Late</p>
            </div>
          </div>
        </div>

        <div className="swiss-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attendanceStats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="swiss-card">
        <h3 className="text-swiss-h3 mb-4">Attendance Records</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-swiss-body">Loading attendance records...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-swiss-h3 mb-2">No attendance records</h3>
            <p className="text-swiss-body">No attendance records found for {selectedDate}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendanceRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-md">
                {trainingMode && record === attendanceRecords[0] && (
                  <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
                    📋 Attendance record
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {record.employee?.full_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{record.employee?.full_name || 'Unknown Employee'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {record.employee?.position?.title || 'No Position'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '-'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-medium">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}