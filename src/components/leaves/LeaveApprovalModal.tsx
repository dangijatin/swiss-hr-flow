
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string | null;
  employee: {
    full_name: string;
    email: string;
  };
}

interface LeaveApprovalModalProps {
  isOpen: boolean;
  request: LeaveRequest | null;
  onClose: () => void;
  onApprove: (comments?: string) => void;
  onReject: (comments?: string) => void;
}

export default function LeaveApprovalModal({ 
  isOpen, 
  request, 
  onClose, 
  onApprove, 
  onReject 
}: LeaveApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleAction = () => {
    if (action === 'approve') {
      onApprove(comments.trim() || undefined);
    } else if (action === 'reject') {
      onReject(comments.trim() || undefined);
    }
    setComments('');
    setAction(null);
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Leave Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{request.employee.full_name}</h3>
            <p className="text-sm text-muted-foreground">{request.employee.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Leave Type:</span>
              <p className="capitalize">{request.leave_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium">Duration:</span>
              <p>{request.days_requested} working day{request.days_requested !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div>
            <span className="font-medium text-sm">Dates:</span>
            <p className="text-sm">
              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
            </p>
          </div>

          {request.reason && (
            <div>
              <span className="font-medium text-sm">Reason:</span>
              <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Manager Comments (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments for the employee..."
              className="input-swiss"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAction('approve');
                handleAction();
              }}
              className="flex-1 btn-ghost text-green-600 hover:bg-green-50 border-green-200"
            >
              <Check size={16} className="mr-2" />
              Approve
            </button>
            <button
              onClick={() => {
                setAction('reject');
                handleAction();
              }}
              className="flex-1 btn-ghost text-red-600 hover:bg-red-50 border-red-200"
            >
              <X size={16} className="mr-2" />
              Reject
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full btn-ghost"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
