import { Users, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({ title, value, icon: Icon, trend, className = "" }: StatCardProps) {
  return (
    <div className={`swiss-card ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-swiss-body">{title}</p>
          <p className="text-swiss-h2 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  trainingMode?: boolean;
}

export default function DashboardStats({ trainingMode }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Employees",
      value: 47,
      icon: Users,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Present Today",
      value: 43,
      icon: CheckCircle,
      trend: { value: 2, isPositive: true }
    },
    {
      title: "On Leave",
      value: 3,
      icon: Calendar,
      trend: { value: -1, isPositive: false }
    },
    {
      title: "Overdue Tasks",
      value: 7,
      icon: AlertTriangle,
      trend: { value: -12, isPositive: true }
    },
    {
      title: "Avg. Hours/Week",
      value: "38.5h",
      icon: Clock,
      trend: { value: 3, isPositive: true }
    }
  ];

  return (
    <div className="relative">
      {trainingMode && (
        <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
          💡 Key metrics at a glance
        </div>
      )}
      
      <div className="swiss-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>
    </div>
  );
}