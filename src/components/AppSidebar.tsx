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
    `flex items-center w-full ${
      isActive 
        ? "bg-brand-soft-green/20 text-brand-soft-green border-r-2 border-brand-soft-green" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
    <Sidebar className="border-r border-border">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={open ? "block" : "sr-only"}>
            {currentRole === 'host' ? 'Host Menu' : 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
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
            <SidebarGroupLabel className={open ? "block" : "sr-only"}>
              Support
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(commonItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info (at bottom when expanded) */}
        {user && profile && open && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="p-3 border-t border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {profile.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
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