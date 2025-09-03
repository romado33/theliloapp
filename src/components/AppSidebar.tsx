import { NavLink, useLocation } from "react-router-dom";
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
import { 
  Home, 
  Search, 
  FileText, 
  Calendar, 
  MessageCircle, 
  User, 
  Settings,
  HelpCircle,
  Plus,
  BarChart3
} from "lucide-react";

const guestItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search Experiences", url: "/search", icon: Search },
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
  const { user, profile, currentRole } = useAuth();
  const { open } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-r from-lilo-green/20 to-lilo-blue/20 text-lilo-green border-r-4 border-lilo-green shadow-soft" 
        : "text-muted-foreground hover:text-lilo-navy hover:bg-gradient-to-r hover:from-lilo-green/10 hover:to-lilo-blue/10 hover:shadow-soft"
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
    <Sidebar className="border-r border-lilo-green/20 w-56 bg-gradient-to-b from-background via-lilo-green/5 to-lilo-blue/10 shadow-medium">
      <SidebarContent>
        {/* Brand Header */}
        <div className="p-4 border-b border-lilo-green/20 bg-gradient-to-r from-lilo-green/10 to-lilo-blue/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {open && (
              <div>
                <h1 className="font-bold text-lilo-navy bg-gradient-brand bg-clip-text text-transparent">
                  LiLo
                </h1>
                <p className="text-xs text-muted-foreground">Live Local</p>
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
        {user && profile && open && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="p-3 border-t border-lilo-green/20 bg-gradient-to-r from-lilo-green/5 to-lilo-blue/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-medium shadow-medium ring-2 ring-lilo-green/20">
                    {profile.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-lilo-navy">
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentRole === 'host' ? 'Host Account' : 'Guest Account'}
                    </p>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}