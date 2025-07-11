import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import EmployeeList from '@/components/employees/EmployeeList';
import DepartmentManagement from '@/components/departments/DepartmentManagement';
import ShiftManagement from '@/components/shifts/ShiftManagement';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import TaskManagement from '@/components/tasks/TaskManagement';
import SettingsManagement from '@/components/settings/SettingsManagement';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [trainingMode, setTrainingMode] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  const handleAddEmployee = () => {
    setShowAddEmployeeModal(true);
  };

  const handleEditEmployee = (employee: any) => {
    console.log('Edit employee:', employee);
  };

  const handleScheduleShift = () => {
    setActiveSection('shifts');
  };

  const handleCreateTask = () => {
    setActiveSection('tasks');
  };

  const handleScheduleMeeting = () => {
    console.log('Schedule meeting clicked');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-swiss-h1">Dashboard</h1>
              <p className="text-swiss-body mt-1">Overview of your team and operations</p>
            </div>
            
            <DashboardStats trainingMode={trainingMode} />
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <QuickActions
                  onAddEmployee={handleAddEmployee}
                  onScheduleShift={handleScheduleShift}
                  onCreateTask={handleCreateTask}
                  onScheduleMeeting={handleScheduleMeeting}
                  trainingMode={trainingMode}
                />
              </div>
              <div>
                <RecentActivity trainingMode={trainingMode} />
              </div>
            </div>
          </div>
        );

      case 'employees':
        return (
          <EmployeeList
            trainingMode={trainingMode}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
          />
        );

      case 'departments':
        return <DepartmentManagement trainingMode={trainingMode} />;

      case 'shifts':
        return <ShiftManagement trainingMode={trainingMode} />;

      case 'attendance':
        return <AttendanceManagement trainingMode={trainingMode} />;

      case 'tasks':
        return <TaskManagement trainingMode={trainingMode} />;

      case 'settings':
        return <SettingsManagement trainingMode={trainingMode} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        trainingMode={trainingMode}
        onToggleTraining={() => setTrainingMode(!trainingMode)}
      />
      
      <main className="flex-1 lg:ml-0 ml-0">
        <div className="p-6 lg:p-8 pt-16 lg:pt-6">
          {trainingMode && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-warning">🎓</span>
                <span className="text-sm font-medium">Training Mode Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Hover over highlighted elements to see helpful tips for using the system.
              </p>
            </div>
          )}
          
          {renderContent()}
        </div>
      </main>

      <AddEmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSuccess={() => {
          // Close modal and refresh if needed
          setShowAddEmployeeModal(false);
        }}
      />
    </div>
  );
};

export default Index;
