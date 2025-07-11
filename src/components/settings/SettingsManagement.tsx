import { useState, useEffect } from 'react';
import { Save, User, Building, Clock, Palette, Bell, Shield, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SettingsManagementProps {
  trainingMode?: boolean;
}

export default function SettingsManagement({ trainingMode }: SettingsManagementProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    avatar_url: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    email_notifications: true,
    sound_enabled: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          display_name: profileData.display_name || '',
          avatar_url: profileData.avatar_url || ''
        });
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      } else {
        toast({ title: "Success", description: "Profile updated successfully" });
      }
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <h3 className="text-swiss-h3">Profile Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input 
            type="text" 
            className="input-swiss" 
            placeholder="Enter your display name"
            value={profile.display_name}
            onChange={(e) => setProfile({...profile, display_name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input 
            type="url" 
            className="input-swiss" 
            placeholder="Enter avatar image URL"
            value={profile.avatar_url}
            onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
          />
        </div>

        <button 
          onClick={handleSaveProfile}
          className="btn-primary"
          disabled={loading}
        >
          <Save size={16} className="mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <h3 className="text-swiss-h3">Company Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input 
            type="text" 
            className="input-swiss" 
            placeholder="Enter company name"
            defaultValue="Acme Corporation"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Working Hours</label>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="time" 
              className="input-swiss" 
              defaultValue="09:00"
            />
            <input 
              type="time" 
              className="input-swiss" 
              defaultValue="17:00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time Zone</label>
          <select className="input-swiss">
            <option>UTC-8 (Pacific Time)</option>
            <option>UTC-5 (Eastern Time)</option>
            <option>UTC+0 (GMT)</option>
            <option>UTC+1 (Central European Time)</option>
          </select>
        </div>

        <button className="btn-primary">
          <Save size={16} className="mr-2" />
          Save Company Settings
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-swiss-h3">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-border rounded-md">
          <div>
            <h4 className="font-medium">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.notifications}
              onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-md">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-muted-foreground">Receive email updates about important events</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.email_notifications}
              onChange={(e) => setPreferences({...preferences, email_notifications: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-md">
          <div>
            <h4 className="font-medium">Sound Effects</h4>
            <p className="text-sm text-muted-foreground">Play sounds for notifications and actions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.sound_enabled}
              onChange={(e) => setPreferences({...preferences, sound_enabled: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        <button className="btn-primary">
          <Save size={16} className="mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h3 className="text-swiss-h3">Appearance</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((theme) => (
              <button
                key={theme}
                onClick={() => setPreferences({...preferences, theme})}
                className={`p-4 border rounded-md text-center capitalize ${
                  preferences.theme === theme 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary">
          <Save size={16} className="mr-2" />
          Save Appearance
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-swiss-h3">Security</h3>
      
      <div className="space-y-4">
        <div className="p-4 border border-border rounded-md">
          <h4 className="font-medium mb-2">Change Password</h4>
          <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure</p>
          <button className="btn-secondary">Change Password</button>
        </div>

        <div className="p-4 border border-border rounded-md">
          <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
          <button className="btn-secondary">Enable 2FA</button>
        </div>

        <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
          <h4 className="font-medium mb-2 text-destructive">Sign Out</h4>
          <p className="text-sm text-muted-foreground mb-4">Sign out from your current session</p>
          <button onClick={handleSignOut} className="btn-destructive">
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'company': return renderCompanySettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'security': return renderSecuritySettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-swiss-h1">Settings</h1>
        <p className="text-swiss-body mt-1">Configure your workspace preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <div className="swiss-card">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {trainingMode && tab.id === 'profile' && (
                      <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full z-10">
                        ⚙️ Settings tab
                      </div>
                    )}
                    <Icon size={16} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="swiss-card">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}