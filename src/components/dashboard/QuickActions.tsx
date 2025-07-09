import { Plus, UserPlus, Calendar, Clock, AlertCircle } from 'lucide-react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function QuickActionCard({ title, description, icon: Icon, onClick, variant = 'secondary' }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`swiss-card text-left w-full group hover:scale-[1.02] transition-transform ${
        variant === 'primary' ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
          variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-swiss-h3 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-swiss-body mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface QuickActionsProps {
  onAddEmployee: () => void;
  onScheduleShift: () => void;
  onCreateTask: () => void;
  onScheduleMeeting: () => void;
  trainingMode?: boolean;
}

export default function QuickActions({ 
  onAddEmployee, 
  onScheduleShift, 
  onCreateTask, 
  onScheduleMeeting,
  trainingMode 
}: QuickActionsProps) {
  const actions = [
    {
      title: "Add New Employee",
      description: "Onboard a new team member",
      icon: UserPlus,
      onClick: onAddEmployee,
      variant: 'primary' as const
    },
    {
      title: "Schedule Shift",
      description: "Assign shifts to employees",
      icon: Clock,
      onClick: onScheduleShift
    },
    {
      title: "Create Task",
      description: "Assign a new task with deadline",
      icon: Plus,
      onClick: onCreateTask
    },
    {
      title: "Schedule Meeting",
      description: "Plan team or department meetings",
      icon: Calendar,
      onClick: onScheduleMeeting
    }
  ];

  return (
    <div className="relative">
      {trainingMode && (
        <div className="absolute -top-2 -left-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
          ⚡ Common actions
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-swiss-h2">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              variant={action.variant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}