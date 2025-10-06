import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, User, LogOut, Settings, Home, LogIn, MapPin, Code } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { DevBypassModal } from '@/components/DevBypassModal';

const Header = () => {
  const { user, profile, signOut, currentRole, switchRole, devBypass } = useAuth();
  const navigate = useNavigate();
  const [showDevModal, setShowDevModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleDevBypass = async (role: 'user' | 'host') => {
    await devBypass(role);
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-background via-lilo-green/5 to-lilo-blue/5 backdrop-blur-sm border-b border-lilo-green/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Much more prominent */}
          <div className="flex items-center gap-4 cursor-pointer group md:hidden" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-brand rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl"></div>
              <img 
                src="/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png" 
                alt="LiLo - Live Local" 
                className="h-14 w-auto relative z-10 drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm text-lilo-navy/70 font-medium tracking-wide -mt-1">
                Live Local
              </div>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lilo-green w-4 h-4" />
              <Input 
                placeholder="Find local experiences..." 
                className="pl-10 bg-background/80 border-lilo-green/30 focus:border-lilo-green"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-lilo-blue/40 text-lilo-blue hover:bg-lilo-blue/10">
              <MapPin className="w-4 h-4" />
              Location
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:flex text-lilo-green hover:bg-lilo-green/10 hover:text-lilo-green-dark">
              Host an experience
            </Button>
            
            {import.meta.env.DEV && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                onClick={() => setShowDevModal(true)}
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Dev</span>
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <span className="text-sm text-lilo-navy/80 hidden sm:inline font-medium">
                  Hi, {user.user_metadata?.first_name || user.email?.split('@')[0]}
                </span>
                <Button variant="outline" size="sm" className="gap-2 border-lilo-navy/30 text-lilo-navy hover:bg-lilo-navy/10" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            ) : (
              <Button variant="brand" size="sm" className="gap-2 shadow-lg" onClick={handleAuthClick}>
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lilo-green w-4 h-4" />
            <Input 
              placeholder="Find local experiences..." 
              className="pl-10 bg-background/80 border-lilo-green/30 focus:border-lilo-green"
            />
          </div>
        </div>
      </div>

      <DevBypassModal 
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSelectRole={handleDevBypass}
      />
    </header>
  );
};

export default Header;