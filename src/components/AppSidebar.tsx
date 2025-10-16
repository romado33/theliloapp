import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Heart, 
  FileText, 
  Calendar, 
  MessageCircle, 
  User, 
  Settings,
  HelpCircle,
  Plus,
  BarChart3,
  Search,
  LogOut
} from "lucide-react";
import liloLogo from "@/assets/lilo-logo.png";

const guestItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search Experiences", url: "/search", icon: Search },
  { title: "Saved", url: "/saved", icon: Heart },
  { title: "My Bookings", url: "/bookings", icon: Calendar },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
];

const hostItems = [
  { title: "Host Dashboard", url: "/host", icon: BarChart3 },
  { title: "My Experiences", url: "/host/experiences", icon: FileText },
  { title: "Create Experience", url: "/host/create", icon: Plus },
  { title: "Bookings", url: "/host/bookings", icon: Calendar },
  { title: "Messages", url: "/host/messages", icon: MessageCircle },
];

const commonItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
  const { user, profile, currentRole, signOut } = useAuth();
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full transition-all duration-300 border-r-4 ${
      isActive 
        ? "bg-lilo-navy/10 text-lilo-navy border-lilo-navy shadow-soft font-medium" 
        : "text-lilo-navy/60 hover:text-lilo-navy hover:bg-lilo-navy/5 hover:shadow-soft border-lilo-navy/20 hover:border-lilo-navy/40"
    }`;

  const renderMenuItems = (items: typeof guestItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink 
              to={item.url} 
              end={item.url === "/"}
              className={getNavClassName}
            >
              <item.icon className="h-4 w-4" />
              {open && <span className="ml-3">{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-border/30 w-56 bg-amber-50 shadow-medium">
      <SidebarContent className="bg-amber-50">
        {/* Brand Header */}
        <div className="p-4 border-b border-border/50 bg-amber-50">
          <div className="flex items-center space-x-3">
            <img 
              src={liloLogo} 
              alt="LiLo - Live Local" 
              className="h-10 w-auto"
            />
            {open && (
              <div>
                <h1 className="font-bold text-lilo-navy text-lg">
                  LiLo
                </h1>
                <p className="text-xs text-lilo-navy/60">Live Local</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${open ? "block" : "sr-only"} text-lilo-navy font-semibold px-3 py-2`}>
            {currentRole === 'host' ? 'Host Menu' : 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            {user ? (
              currentRole === 'host' ? renderMenuItems(hostItems) : renderMenuItems(guestItems)
            ) : (
              renderMenuItems([
                { title: "Home", url: "/", icon: Home },
                { title: "Search Experiences", url: "/search", icon: Search },
              ])
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings & Support */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel className={`${open ? "block" : "sr-only"} text-lilo-navy font-semibold px-3 py-2`}>
              Support
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              {renderMenuItems(commonItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info (at bottom when expanded) */}
        {user && profile && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="p-3 border-t border-border/30 bg-amber-50">
                {open ? (
                  <>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-medium shadow-medium">
                        {profile.first_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-lilo-navy">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-lilo-navy/60 truncate">
                          {currentRole === 'host' ? 'Host Account' : 'Guest Account'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 border-lilo-navy/30 text-lilo-navy hover:bg-lilo-navy/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full p-2 hover:bg-lilo-navy/10"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4 text-lilo-navy" />
                  </Button>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}