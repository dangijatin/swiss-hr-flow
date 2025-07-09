import { Clock, CheckCircle, UserPlus, Calendar, AlertTriangle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'check-in' | 'task-completed' | 'new-employee' | 'meeting-scheduled' | 'overdue';
  title: string;
  subtitle: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
}

interface RecentActivityProps {
  trainingMode?: boolean;
}

export default function RecentActivity({ trainingMode }: RecentActivityProps) {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'check-in',
      title: 'Sarah Chen checked in',
      subtitle: 'Development Team',
      time: '9:15 AM',
      icon: CheckCircle,
      iconColor: 'text-success'
    },
    {
      id: '2',
      type: 'task-completed',
      title: 'Task completed',
      subtitle: 'Q4 Report Analysis by Michael Torres',
      time: '8:45 AM',
      icon: CheckCircle,
      iconColor: 'text-success'
    },
    {
      id: '3',
      type: 'new-employee',
      title: 'New employee added',
      subtitle: 'Emma Rodriguez - UX Designer',
      time: 'Yesterday',
      icon: UserPlus,
      iconColor: 'text-primary'
    },
    {
      id: '4',
      type: 'meeting-scheduled',
      title: 'Team meeting scheduled',
      subtitle: 'Design Review - Tomorrow 2:00 PM',
      time: 'Yesterday',
      icon: Calendar,
      iconColor: 'text-muted-foreground'
    },
    {
      id: '5',
      type: 'overdue',
      title: 'Task overdue',
      subtitle: 'Client Presentation by Alex Kim',
      time: '2 days ago',
      icon: AlertTriangle,
      iconColor: 'text-destructive'
    }
  ];

  return (
    <div className="swiss-card relative">
      {trainingMode && (
        <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
          📋 Latest updates
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-swiss-h3">Recent Activity</h2>
        <button className="text-primary text-sm hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-swiss-body truncate">
                  {activity.subtitle}
                </p>
              </div>
              
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}