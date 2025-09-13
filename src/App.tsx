import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ExperienceSearch from "./pages/ExperienceSearch";
import ExperienceDetails from "./pages/ExperienceDetails";
import UserDashboard from "./pages/UserDashboard";
import HostDashboard from "./pages/HostDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import BookingConfirmation from "./pages/BookingConfirmation";
import Messages from "./pages/Messages";
import SavedExperiences from "./pages/SavedExperiences";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true} className="w-full">
            <div className="min-h-screen flex w-full">
              {/* Global sidebar trigger - always visible */}
              <header className="fixed top-4 left-4 z-50 md:hidden">
                <SidebarTrigger className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-md" />
              </header>

              <AppSidebar />
              
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/search" element={<ExperienceSearch />} />
                  <Route path="/experience/:id" element={<ExperienceDetails />} />
                  <Route path="/bookings" element={<UserDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/settings" element={<Settings />} />
            <Route path="/saved" element={<SavedExperiences />} />
            <Route path="/support" element={<Support />} />
                  
                  {/* Host Routes */}
                  <Route path="/host-dashboard" element={<HostDashboard />} />
                  <Route path="/host" element={<HostDashboard />} />
                  <Route path="/host/experiences" element={<HostDashboard />} />
                  <Route path="/host/create" element={<HostDashboard />} />
                  <Route path="/host/bookings" element={<HostDashboard />} />
                  <Route path="/host/messages" element={<HostDashboard />} />
                  
                  <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
