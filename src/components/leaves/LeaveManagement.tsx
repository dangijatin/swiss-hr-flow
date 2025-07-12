
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LeaveCalendar from './LeaveCalendar';
import LeaveTracker from './LeaveTracker';
import LeaveRequestModal from './LeaveRequestModal';
import LeaveApprovalModal from './LeaveApprovalModal';

interface LeaveRequest {
  id: string;
  employee_id: string;
  manager_id: string | null;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string | null;
  manager_comments: string | null;
  requested_at: string;
  reviewed_at: string | null;
  employee: {
    full_name: string;
    email: string;
  };
}

interface LeaveManagementProps {
  trainingMode?: boolean;
}

export default function LeaveManagement({ trainingMode }: LeaveManagementProps) {
  const [activeTab, setActiveTab] = useState<'my-leaves' | 'calendar' | 'approvals'>('my-leaves');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyLeaveRequests();
    fetchPendingApprovals();
  }, []);

  const fetchMyLeaveRequests = async () => {
    setLoading(true);
    try {
      // For now, we'll use a placeholder since the leave_requests table might not be in types yet
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .limit(0); // Get no results, just test the connection

      if (error) {
        console.error('Database connection error:', error);
      }

      // Mock data for now until the database types are updated
      setLeaveRequests([]);
      
    } catch (error) {
      console.error('Error in fetchMyLeaveRequests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave requests",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const fetchPendingApprovals = async () => {
    try {
      // For now, we'll use a placeholder since the leave_requests table might not be in types yet
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .limit(0); // Get no results, just test the connection

      if (error) {
        console.error('Database connection error:', error);
      }

      // Mock data for now until the database types are updated
      setPendingApprovals([]);
      
    } catch (error) {
      console.error('Error in fetchPendingApprovals:', error);
    }
  };

  const handleApprovalAction = async (requestId: string, action: 'approve' | 'reject', comments?: string) => {
    toast({
      title: "Info",
      description: "Leave approval system will be fully functional once database types are updated."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'text-blue-600 bg-blue-50';
      case 'sick': return 'text-red-600 bg-red-50';
      case 'personal': return 'text-purple-600 bg-purple-50';
      case 'maternity': return 'text-pink-600 bg-pink-50';
      case 'paternity': return 'text-indigo-600 bg-indigo-50';
      case 'emergency': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-swiss-h1">Leave Management</h1>
          <p className="text-swiss-body mt-1">Manage leave requests and approvals</p>
        </div>
        
        <button 
          onClick={() => setShowRequestModal(true)} 
          className="btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Request Leave
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { key: 'my-leaves', label: 'My Leaves', icon: Clock },
            { key: 'calendar', label: 'Calendar', icon: Calendar },
            { key: 'approvals', label: `Approvals (${pendingApprovals.length})`, icon: User }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'my-leaves' && (
        <div className="space-y-6">
          <LeaveTracker />
          
          <div className="swiss-card">
            <h3 className="text-swiss-h3 mb-4">My Leave Requests</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-swiss-body">Loading leave requests...</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-swiss-body">No leave requests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="border border-border rounded-md p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(request.leave_type)}`}>
                            {request.leave_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-swiss-body">
                          <strong>{new Date(request.start_date).toLocaleDateString()}</strong> to{' '}
                          <strong>{new Date(request.end_date).toLocaleDateString()}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.days_requested} working day{request.days_requested !== 1 ? 's' : ''}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                        )}
                        {request.manager_comments && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Manager Comments:</strong> {request.manager_comments}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <LeaveCalendar />
      )}

      {activeTab === 'approvals' && (
        <div className="swiss-card">
          <h3 className="text-swiss-h3 mb-4">Pending Approvals</h3>
          
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-swiss-body">No pending approvals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((request) => (
                <div key={request.id} className="border border-border rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{request.employee.full_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(request.leave_type)}`}>
                          {request.leave_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-swiss-body">
                        <strong>{new Date(request.start_date).toLocaleDateString()}</strong> to{' '}
                        <strong>{new Date(request.end_date).toLocaleDateString()}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.days_requested} working day{request.days_requested !== 1 ? 's' : ''}
                      </p>
                      {request.reason && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                        }}
                        className="btn-ghost p-2"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleApprovalAction(request.id, 'approve')}
                        className="btn-ghost p-2 text-green-600 hover:bg-green-50"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleApprovalAction(request.id, 'reject')}
                        className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <LeaveRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false);
          fetchMyLeaveRequests();
        }}
      />

      <LeaveApprovalModal
        isOpen={showApprovalModal}
        request={selectedRequest}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRequest(null);
        }}
        onApprove={(comments) => {
          if (selectedRequest) {
            handleApprovalAction(selectedRequest.id, 'approve', comments);
            setShowApprovalModal(false);
            setSelectedRequest(null);
          }
        }}
        onReject={(comments) => {
          if (selectedRequest) {
            handleApprovalAction(selectedRequest.id, 'reject', comments);
            setShowApprovalModal(false);
            setSelectedRequest(null);
          }
        }}
      />
    </div>
  );
}
