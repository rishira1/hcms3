import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Confirmation from "@/pages/confirmation";
import AdminLogin from "@/pages/admin-login";
import DistrictDashboard from "@/pages/district-dashboard";
import StateDashboard from "@/pages/state-dashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole?: 'district_gs' | 'state_gs' 
}) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Redirect to="/admin/login" />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/confirmation" component={Confirmation} />
        <Route path="/admin/login">
          {isAuthenticated ? <Redirect to="/admin/dashboard" /> : <AdminLogin />}
        </Route>
        <Route path="/admin/district">
          <ProtectedRoute requiredRole="district_gs">
            <DistrictDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/state">
          <ProtectedRoute requiredRole="state_gs">
            <StateDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/dashboard">
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  
  if (user?.role === 'district_gs') {
    return <Redirect to="/admin/district" />;
  } else if (user?.role === 'state_gs') {
    return <Redirect to="/admin/state" />;
  }
  
  return <Redirect to="/admin/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
