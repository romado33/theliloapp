import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load routes for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ExperienceSearch = lazy(() => import("./pages/ExperienceSearch"));
const ExperienceDetails = lazy(() => import("./pages/ExperienceDetails"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const HostDashboard = lazy(() => import("./pages/HostDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const Messages = lazy(() => import("./pages/Messages"));
const SavedExperiences = lazy(() => import("./pages/SavedExperiences"));
const Support = lazy(() => import("./pages/Support"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const TestingPlan = lazy(() => import("./pages/TestingPlan"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 60 * 60 * 1000, // 1 hour (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component for lazy-loaded routes
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-3/4" />
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
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
                  <Suspense fallback={<PageLoadingFallback />}>
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
                      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                      
                      {/* Payment Routes */}
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/payment-canceled" element={<PaymentCanceled />} />
                      
                      {/* Legal Pages */}
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/testing-plan" element={<TestingPlan />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
