import { useState } from 'react';
import { Users, Building, Clock, Calendar, CheckSquare, BarChart3, Settings, Menu, X, HelpCircle, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  trainingMode?: boolean;
  onToggleTraining?: () => void;
}
const navigationItems = [{
  id: 'dashboard',
  label: 'Dashboard',
  icon: BarChart3
}, {
  id: 'employees',
  label: 'Employees',
  icon: Users
}, {
  id: 'departments',
  label: 'Departments',
  icon: Building
}, {
  id: 'shifts',
  label: 'Shifts',
  icon: Clock
}, {
  id: 'attendance',
  label: 'Attendance',
  icon: Calendar
}, {
  id: 'tasks',
  label: 'Tasks',
  icon: CheckSquare
}, {
  id: 'settings',
  label: 'Settings',
  icon: Settings
}];
export default function Navigation({
  activeSection,
  onSectionChange,
  trainingMode = false,
  onToggleTraining
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    user,
    userRole,
    signOut
  } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };
  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  return <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="btn-secondary p-2">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation sidebar */}
      <nav className={cn("fixed lg:static left-0 top-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-swiss-h3">Kaleshkari HR</h1>
              <p className="text-xs text-muted-foreground">Employee Management</p>
            </div>
          </div>

          {/* Training Mode Toggle */}
          {onToggleTraining && <div className="mb-6">
              <button onClick={onToggleTraining} className={cn("w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors", trainingMode ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>
                <HelpCircle size={16} />
                Training Mode {trainingMode ? 'ON' : 'OFF'}
              </button>
            </div>}

          {/* Navigation items */}
          <ul className="space-y-1">
            {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return <li key={item.id}>
                  <button onClick={() => {
                onSectionChange(item.id);
                setIsMobileMenuOpen(false);
              }} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                    <Icon size={18} />
                    {item.label}
                  </button>
                </li>;
          })}
          </ul>

          {/* User Profile Section */}
          <div className="absolute bottom-4 left-4 right-4">
            {user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {getUserInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      {userRole && <p className="text-xs text-muted-foreground capitalize">
                          {userRole.replace('_', ' ')}
                        </p>}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" side="top">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      {userRole && <p className="text-xs leading-none text-muted-foreground capitalize">
                          {userRole.replace('_', ' ')}
                        </p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30" onClick={() => setIsMobileMenuOpen(false)} />}
    </>;
}