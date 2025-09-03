import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Search, MapPin, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png" 
              alt="Lilo - Live Local" 
              className="h-10 w-auto"
            />
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Find local experiences..." 
                className="pl-10 bg-background/50"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              Host an experience
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Hi, {user.user_metadata?.first_name || user.email?.split('@')[0]}
                </span>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAuthClick}>
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Find local experiences..." 
              className="pl-10 bg-background/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;